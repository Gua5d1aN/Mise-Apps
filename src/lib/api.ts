/**
 * All Supabase database interactions — org_id scoped.
 * @author Joshua Bosen
 */
import { supabase } from './supabase';
import { ORG_ID } from './org';
import { migrateConfig } from './utils';
import type { ChecklistConfig, ChecklistLog, ChecklistLogInsert, IssueLog, IssueLogInsert } from '../types';

export async function fetchConfig(): Promise<ChecklistConfig | null> {
  const { data, error } = await supabase.from('checklist_config').select('config').eq('org_id', ORG_ID).maybeSingle();
  if (error) { console.error('[Mise] fetchConfig:', error.message); throw new Error(error.message); }
  if (!data) return null;
  return migrateConfig(data.config as ChecklistConfig);
}
export async function saveConfig(config: ChecklistConfig): Promise<void> {
  const { error } = await supabase.from('checklist_config').upsert({ org_id: ORG_ID, config, updated_at: new Date().toISOString() }, { onConflict: 'org_id' });
  if (error) { console.error('[Mise] saveConfig:', error.message); throw new Error(error.message); }
}
export async function insertLog(log: ChecklistLogInsert): Promise<void> {
  const { error } = await supabase.from('checklist_logs').insert({ ...log, org_id: ORG_ID });
  if (error) { console.error('[Mise] insertLog:', error.message); throw new Error(error.message); }
}
export async function fetchLogs(): Promise<ChecklistLog[]> {
  const { data, error } = await supabase.from('checklist_logs').select('*').eq('org_id', ORG_ID).order('created_at', { ascending: false });
  if (error) { console.error('[Mise] fetchLogs:', error.message); throw new Error(error.message); }
  return (data ?? []) as ChecklistLog[];
}
export async function deleteLogsByIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('checklist_logs').delete().in('id', ids).eq('org_id', ORG_ID);
  if (error) { console.error('[Mise] deleteLogsByIds:', error.message); throw new Error(error.message); }
}
export async function deleteAllLogs(): Promise<void> {
  const { error } = await supabase.from('checklist_logs').delete().eq('org_id', ORG_ID);
  if (error) { console.error('[Mise] deleteAllLogs:', error.message); throw new Error(error.message); }
}
export async function insertIssue(issue: IssueLogInsert): Promise<void> {
  const { error } = await supabase.from('issue_logs').insert({ ...issue, org_id: ORG_ID });
  if (error) { console.error('[Mise] insertIssue:', error.message); throw new Error(error.message); }
}
export async function fetchIssues(): Promise<IssueLog[]> {
  const { data, error } = await supabase.from('issue_logs').select('*').eq('org_id', ORG_ID).order('created_at', { ascending: false });
  if (error) { console.error('[Mise] fetchIssues:', error.message); throw new Error(error.message); }
  return (data ?? []) as IssueLog[];
}
export async function resolveIssue(id: number, resolved: boolean): Promise<void> {
  const { error } = await supabase.from('issue_logs').update({ resolved, resolved_at: resolved ? new Date().toISOString() : null }).eq('id', id).eq('org_id', ORG_ID);
  if (error) { console.error('[Mise] resolveIssue:', error.message); throw new Error(error.message); }
}
