/**
 * Utility functions for Mise Checklists.
 * @author Joshua Bosen
 */
import type { ChecklistConfig, ChecklistLog, IssueLog, ShiftEnabled } from '../types';
import { STRUCTURE, SHIFTS, DEFAULT_ENABLED } from '../constants';

export function deepClone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export function migrateConfig(config: ChecklistConfig): ChecklistConfig {
  const u = deepClone(config) as Record<string, Record<string, unknown>>;
  for (const loc of Object.keys(STRUCTURE)) {
    if (!u[loc]) u[loc] = {};
    const locData = u[loc] as Record<string, unknown>;
    if (!Array.isArray(locData['_sections'])) locData['_sections'] = deepClone(STRUCTURE[loc]);
    const sections = locData['_sections'] as string[];
    for (const sec of sections) {
      if (!locData[sec] || typeof locData[sec] !== 'object') locData[sec] = { _enabled: deepClone(DEFAULT_ENABLED) };
      const secData = locData[sec] as Record<string, unknown>;
      if (!secData['_enabled'] || typeof secData['_enabled'] !== 'object') secData['_enabled'] = deepClone(DEFAULT_ENABLED);
      const enabled = secData['_enabled'] as Record<string, boolean>;
      for (const sh of SHIFTS) {
        if (!Array.isArray(secData[sh])) secData[sh] = [];
        secData[sh] = (secData[sh] as unknown[]).map((t) => typeof t === 'string' ? { text: t, requiresPhoto: false } : t);
        if (enabled[sh] === undefined) enabled[sh] = DEFAULT_ENABLED[sh as keyof ShiftEnabled] ?? false;
      }
    }
  }
  return u as unknown as ChecklistConfig;
}

function dateKey(dateStr: string): string {
  const d = new Date(dateStr), now = new Date(), y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Today \u2014 ${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
  if (d.toDateString() === y.toDateString()) return `Yesterday \u2014 ${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function groupLogsByDate(logs: ChecklistLog[]): { groups: Record<string, Record<string, ChecklistLog[]>>; keys: string[] } {
  const groups: Record<string, Record<string, ChecklistLog[]>> = {}, keys: string[] = [];
  for (const log of logs) {
    const dk = dateKey(log.created_at);
    if (!groups[dk]) { groups[dk] = {}; keys.push(dk); }
    if (!groups[dk][log.location]) groups[dk][log.location] = [];
    groups[dk][log.location].push(log);
  }
  return { groups, keys };
}

export function groupIssuesByDate(issues: IssueLog[]): { groups: Record<string, IssueLog[]>; keys: string[] } {
  const groups: Record<string, IssueLog[]> = {}, keys: string[] = [];
  for (const issue of issues) {
    const dk = dateKey(issue.created_at);
    if (!groups[dk]) { groups[dk] = []; keys.push(dk); }
    groups[dk].push(issue);
  }
  return { groups, keys };
}
