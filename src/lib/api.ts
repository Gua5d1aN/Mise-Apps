/**
 * All Supabase database interactions for Mise Checklists.
 *
 * Every DB operation lives here — centralised for auditing, error handling,
 * and to make Phase 2 org_id scoping a single-location change per function.
 *
 * @author Joshua Bosen
 */
import { supabase } from './supabase';
import { migrateConfig } from './utils';
import type { ChecklistConfig, ChecklistLog, ChecklistLogInsert, IssueLog, IssueLogInsert } from '../types';

// ─── Checklist Configuration ──────────────────────────────────────────────────

/** Fetches the saved checklist config. Returns null if none saved yet. */
export async function fetchConfig(): Promise<ChecklistConfig | null> {
  const { data, error } = await supabase
    .from('checklist_config')
    .select('config')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('[Mise] fetchConfig:', error.message);
    throw new Error(error.message);
  }

  if (!data) return null;
  return migrateConfig(data.config as ChecklistConfig);
}

/** Upserts the full checklist config to Supabase. */
export async function saveConfig(config: ChecklistConfig): Promise<void> {
  const { error } = await supabase.from('checklist_config').upsert({
    id: 1,
    config,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Mise] saveConfig:', error.message);
    throw new Error(error.message);
  }
}

// ─── Checklist Logs ───────────────────────────────────────────────────────────

/** Inserts a completed checklist submission. */
export async function insertLog(log: ChecklistLogInsert): Promise<void> {
  const { error } = await supabase.from('checklist_logs').insert(log);
  if (error) { console.error('[Mise] insertLog:', error.message); throw new Error(error.message); }
}

/**
 * Fetches all checklist logs, ordered newest first.
 *
 * ⚠️  Phase 2: RLS will automatically scope this to the current org —
 * no code change needed here, just the database policy.
 */
export async function fetchLogs(): Promise<ChecklistLog[]> {
  const { data, error } = await supabase
    .from('checklist_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Mise] fetchLogs:', error.message); throw new Error(error.message); }
  return (data ?? []) as ChecklistLog[];
}

/** Deletes specific checklist logs by ID. No-op if ids is empty. */
export async function deleteLogsByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('checklist_logs').delete().in('id', ids);
  if (error) { console.error('[Mise] deleteLogsByIds:', error.message); throw new Error(error.message); }
}

/**
 * Deletes all checklist logs.
 *
 * The `.gt('id', 0)` filter is required because Supabase's REST API rejects
 * DELETE requests with no filter as a safety measure against accidental bulk deletes.
 *
 * ⚠️  Phase 2: RLS will scope this to the current org only.
 */
export async function deleteAllLogs(): Promise<void> {
  const { error } = await supabase.from('checklist_logs').delete().gt('id', 0);
  if (error) { console.error('[Mise] deleteAllLogs:', error.message); throw new Error(error.message); }
}

// ─── Issue / Maintenance Logs ─────────────────────────────────────────────────

/** Inserts a new maintenance issue report to the issue_logs table. */
export async function insertIssue(issue: IssueLogInsert): Promise<void> {
  const { error } = await supabase.from('issue_logs').insert(issue);
  if (error) { console.error('[Mise] insertIssue:', error.message); throw new Error(error.message); }
}

/**
 * Fetches all issue logs, ordered newest first.
 *
 * ⚠️  Phase 2: RLS will automatically scope this to the current org.
 */
export async function fetchIssues(): Promise<IssueLog[]> {
  const { data, error } = await supabase
    .from('issue_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[Mise] fetchIssues:', error.message); throw new Error(error.message); }
  return (data ?? []) as IssueLog[];
}
