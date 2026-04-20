/**
 * Admin authentication for Mise Checklists — Phase 3.
 *
 * Security model:
 *   - PINs are SHA-256 hashed in the browser before leaving the device.
 *   - Hash is salted with org_id — same PIN at different venues = different hash.
 *   - Verification via SECURITY DEFINER Postgres function — pin_hash never
 *     exposed via the REST API.
 *   - Sessions stored in sessionStorage with 8-hour expiry.
 *
 * Location access control:
 *   - Each admin has an assigned locations array (e.g. ['Kitchen', 'Bar']).
 *   - NULL or empty array = all locations (owner default).
 *   - Owners always see all locations regardless of their assignment.
 *   - Filtering is applied in the admin panel — logs/results/issues scoped
 *     to the admin's assigned locations automatically.
 *
 * @author Joshua Bosen
 */
import { supabase } from './supabase';
import { ORG_ID } from './org';

// ─── Session ──────────────────────────────────────────────────────────────────

export interface AdminSession {
  adminName: string;
  role: 'admin' | 'owner';
  /** Locations this admin can see. Empty array / null = all locations. */
  locations: string[];
  expiresAt: number;
}

const SESSION_KEY = 'mise_admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export function getSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(adminName: string, role: 'admin' | 'owner', locations: string[] = []): AdminSession {
  const session: AdminSession = {
    adminName,
    role,
    locations,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Returns the locations an admin can access.
 * Owners always get all locations (null/empty = unrestricted).
 * Admins get their assigned locations, or all if none assigned.
 */
export function getAccessibleLocations(session: AdminSession, allLocations: string[]): string[] {
  if (session.role === 'owner') return allLocations;
  if (!session.locations || session.locations.length === 0) return allLocations;
  return session.locations;
}

// ─── PIN hashing ──────────────────────────────────────────────────────────────

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${ORG_ID}:${pin}`);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Verification ─────────────────────────────────────────────────────────────

export async function verifyPin(pin: string): Promise<AdminSession | null> {
  const pinHash = await hashPin(pin);

  const { data, error } = await supabase.rpc('verify_admin_pin', {
    p_org_id: ORG_ID,
    p_pin_hash: pinHash,
  });

  if (error) {
    console.error('[Mise] verifyPin:', error.message);
    throw new Error(error.message);
  }

  if (!data || (data as unknown[]).length === 0) return null;

  const record = (data as Array<{ admin_name: string; admin_role: string; admin_locations: string[] | null }>)[0];
  return saveSession(
    record.admin_name,
    record.admin_role as 'admin' | 'owner',
    record.admin_locations ?? [],
  );
}

// ─── Admin name list ──────────────────────────────────────────────────────────

export async function fetchAdminNames(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_admin_names', {
    p_org_id: ORG_ID,
  });

  if (error) {
    console.error('[Mise] fetchAdminNames:', error.message);
    throw new Error(error.message);
  }

  return (data as Array<{ admin_name: string }>).map((r) => r.admin_name);
}

// ─── Admin account management ─────────────────────────────────────────────────

export interface AdminAccount {
  id: number;
  name: string;
  role: 'admin' | 'owner';
  /** Locations this admin can access. Empty = all locations. */
  locations: string[];
  created_at: string;
}

export async function fetchAdminAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await supabase.rpc('get_admin_accounts', {
    p_org_id: ORG_ID,
  });

  if (error) {
    console.error('[Mise] fetchAdminAccounts:', error.message);
    throw new Error(error.message);
  }

  // The RPC returns admin_name / admin_role (aliased) — remap to match the interface.
  return (data ?? []).map((r: { id: number; admin_name: string; admin_role: string; locations: string[] | null; created_at: string }) => ({
    id: r.id,
    name: r.admin_name,
    role: r.admin_role as 'admin' | 'owner',
    locations: r.locations ?? [],
    created_at: r.created_at,
  }));
}

export async function createAdminAccount(
  name: string,
  pin: string,
  role: 'admin' | 'owner' = 'admin',
  locations: string[] = [],
): Promise<void> {
  const pinHash = await hashPin(pin);

  const { error } = await supabase.from('admin_accounts').insert({
    org_id: ORG_ID,
    name: name.trim(),
    pin_hash: pinHash,
    role,
    locations: locations.length > 0 ? locations : null,
  });

  if (error) {
    console.error('[Mise] createAdminAccount:', error.message);
    if (error.code === '23505') throw new Error(`An admin named "${name}" already exists.`);
    throw new Error(error.message);
  }
}

export async function resetAdminPin(id: number, newPin: string): Promise<void> {
  const pinHash = await hashPin(newPin);

  const { error } = await supabase
    .from('admin_accounts')
    .update({ pin_hash: pinHash })
    .eq('id', id)
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] resetAdminPin:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Updates the locations an admin can access.
 * Pass an empty array to grant access to all locations.
 *
 * @param id        - The admin account ID.
 * @param locations - Array of location names, e.g. ['Kitchen', 'Bar'].
 */
export async function updateAdminLocations(id: number, locations: string[]): Promise<void> {
  const { error } = await supabase
    .from('admin_accounts')
    .update({ locations: locations.length > 0 ? locations : null })
    .eq('id', id)
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] updateAdminLocations:', error.message);
    throw new Error(error.message);
  }
}

export async function deleteAdminAccount(id: number): Promise<void> {
  const { error } = await supabase
    .from('admin_accounts')
    .delete()
    .eq('id', id)
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] deleteAdminAccount:', error.message);
    throw new Error(error.message);
  }
}
