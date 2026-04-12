/**
 * Application-wide constants for Mise Checklists.
 *
 * STRUCTURE defines the default location → section hierarchy for 1 Hotel Melbourne.
 * In Phase 4 this will be fetched per-organisation from Supabase, allowing
 * each venue to define their own departments and sections during onboarding.
 *
 * @author Joshua Bosen
 */
import type { Shift, ShiftEnabled } from '../types';

// ─── Venue Structure ──────────────────────────────────────────────────────────

export const STRUCTURE: Record<string, string[]> = {
  Kitchen: ['Grill', 'Larder', 'Pans', 'Fryer', 'Overnight Only'],
  FOH:     ['Floor', 'Host / Reception', 'Terrace'],
  Bar:     ['Crane Bar', 'Back Bar', 'LVL1 Bar'],
  IRD:     ['IRD'],
};

export const LOCS: string[] = Object.keys(STRUCTURE);

export const SHIFTS: Shift[] = ['Opening', 'Closing', 'Overnight', 'Weekly', 'Bi-Weekly', 'Monthly'];

/**
 * Default per-shift enabled state for new sections.
 * Opening and Closing are on by default. All others are opt-in from
 * the admin Edit Checklists panel.
 */
export const DEFAULT_ENABLED: ShiftEnabled = {
  Opening:     true,
  Closing:     true,
  Overnight:   false,
  Weekly:      false,
  'Bi-Weekly': false,
  Monthly:     false,
};

// ─── Admin Access ─────────────────────────────────────────────────────────────

/**
 * ⚠️  PHASE 1 ONLY — Temporary admin password gate.
 *
 * This value is embedded in the compiled JS bundle by Vite — it is NOT
 * truly secret. Phase 3 replaces this entirely with Supabase Auth
 * (magic link + org_members role table).
 *
 * @see Phase 3 — Real Authentication (pipeline doc)
 */
export const ADMIN_PW: string = import.meta.env.VITE_ADMIN_PW ?? '';
