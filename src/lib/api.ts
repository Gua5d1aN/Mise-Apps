/**
 * All Supabase database interactions for Mise Checklists.
 *
 * Every query is scoped to the current organisation via ORG_ID. This is the
 * core of Phase 2 multi-tenancy — no query can read or write another venue's
 * data because every operation includes an explicit org_id filter.
 *
 * Security model (Phase 2):
 *   Layer 1 — App: every query explicitly filters by ORG_ID from the env var
 *   Layer 2 — RLS: permissive policies allow the anon key through (Phase 2)
 *
 * Phase 3 will add:
 *   Layer 2 — RLS: strict policies using get_my_org_id() based on auth session
 *   Layer 3 — Auth: Supabase magic link replaces the admin password gate
 *
 * @author Joshua Bosen
 */
import { supabase } from './supabase';
import { ORG_ID } from './org';
import { migrateConfig } from './utils';
import type {
  ChecklistConfig,
  ChecklistLog,
  ChecklistLogInsert,
  IssueLog,
  IssueLogInsert,
} from '../types';

// ─── Checklist Configuration ──────────────────────────────────────────────────

/**
 * Fetches the checklist config for the current organisation.
 *
 * Uses org_id as the lookup key (not the old hardcoded id=1) so each
 * venue gets their own independently configurable checklist structure.
 *
 * Returns null if no config has been saved yet — the app falls back to
 * DEFAULT_TASKS and creates a config row on the first admin save.
 */
export async function fetchConfig(): Promise<ChecklistConfig | null> {
  const { data, error } = await supabase
    .from('checklist_config')
    .select('config')
    .eq('org_id', ORG_ID)
    .maybeSingle();

  if (error) {
    console.error('[Mise] fetchConfig:', error.message);
    throw new Error(error.message);
  }

  if (!data) return null;
  return migrateConfig(data.config as ChecklistConfig);
}

/**
 * Saves the checklist config for the current organisation.
 *
 * Uses upsert with onConflict: 'org_id' — creates the row on first save,
 * updates it on all subsequent saves. This replaces the old id=1 upsert.
 */
export async function saveConfig(config: ChecklistConfig): Promise<void> {
  const { error } = await supabase
    .from('checklist_config')
    .upsert(
      { org_id: ORG_ID, config, updated_at: new Date().toISOString() },
      { onConflict: 'org_id' },
    );

  if (error) {
    console.error('[Mise] saveConfig:', error.message);
    throw new Error(error.message);
  }
}

// ─── Checklist Logs ───────────────────────────────────────────────────────────

/**
 * Inserts a completed checklist submission for the current organisation.
 * org_id is stamped on the row at insert time.
 */
export async function insertLog(log: ChecklistLogInsert): Promise<void> {
  const { error } = await supabase
    .from('checklist_logs')
    .insert({ ...log, org_id: ORG_ID });

  if (error) {
    console.error('[Mise] insertLog:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Fetches all checklist logs for the current organisation, newest first.
 *
 * The explicit .eq('org_id', ORG_ID) filter means a misconfigured RLS policy
 * can never accidentally return another venue's submissions — the app-level
 * filter is an independent safety net.
 */
export async function fetchLogs(): Promise<ChecklistLog[]> {
  const { data, error } = await supabase
    .from('checklist_logs')
    .select('*')
    .eq('org_id', ORG_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Mise] fetchLogs:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as ChecklistLog[];
}

/**
 * Deletes specific checklist logs by ID, scoped to the current org.
 *
 * The org_id filter on delete ensures an admin can only delete their own
 * venue's submissions even if the IDs were somehow obtained externally.
 */
export async function deleteLogsByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await supabase
    .from('checklist_logs')
    .delete()
    .in('id', ids)
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] deleteLogsByIds:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Deletes all checklist logs for the current organisation.
 *
 * Scoped to org_id — this can never delete another venue's data.
 */
export async function deleteAllLogs(): Promise<void> {
  const { error } = await supabase
    .from('checklist_logs')
    .delete()
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] deleteAllLogs:', error.message);
    throw new Error(error.message);
  }
}

// ─── Issue / Maintenance Logs ─────────────────────────────────────────────────

/**
 * Inserts a new maintenance issue report for the current organisation.
 * org_id is stamped on the row at insert time.
 */
export async function insertIssue(issue: IssueLogInsert): Promise<void> {
  const { error } = await supabase
    .from('issue_logs')
    .insert({ ...issue, org_id: ORG_ID });

  if (error) {
    console.error('[Mise] insertIssue:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Fetches all issue logs for the current organisation, newest first.
 */
export async function fetchIssues(): Promise<IssueLog[]> {
  const { data, error } = await supabase
    .from('issue_logs')
    .select('*')
    .eq('org_id', ORG_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Mise] fetchIssues:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as IssueLog[];
}

/**
 * Toggles the resolved state of a maintenance issue.
 *
 * Scoped to org_id so an admin can only update their own venue's issues.
 *
 * @param id       - The issue log ID to update.
 * @param resolved - The new resolved state to set.
 */
export async function resolveIssue(id: number, resolved: boolean): Promise<void> {
  const { error } = await supabase
    .from('issue_logs')
    .update({
      resolved,
      resolved_at: resolved ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('org_id', ORG_ID);

  if (error) {
    console.error('[Mise] resolveIssue:', error.message);
    throw new Error(`Failed to update issue: ${error.message}`);
  }
}
