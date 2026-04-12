/**
 * Utility functions for Mise Checklists.
 *
 * @author Joshua Bosen
 */
import type { ChecklistConfig, ChecklistLog, IssueLog, ShiftEnabled } from '../types';
import { STRUCTURE, SHIFTS, DEFAULT_ENABLED } from '../constants';

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Migrates a stored config from any historical format to the current shape.
 *
 * Handles:
 *   - Tasks stored as plain strings (pre-photo era) → Task objects
 *   - Missing _sections key → seeded from STRUCTURE constant
 *   - Missing _enabled key on sections → seeded from DEFAULT_ENABLED
 *   - Missing shift arrays → empty arrays
 *   - Missing shift keys in _enabled → DEFAULT_ENABLED[shift]
 *
 * This function is idempotent — running it on an already-migrated config
 * returns it unchanged.
 */
export function migrateConfig(config: ChecklistConfig): ChecklistConfig {
  const u = deepClone(config) as Record<string, Record<string, unknown>>;

  for (const loc of Object.keys(STRUCTURE)) {
    if (!u[loc]) u[loc] = {};
    const locData = u[loc] as Record<string, unknown>;

    // Ensure _sections exists
    if (!Array.isArray(locData['_sections'])) {
      locData['_sections'] = deepClone(STRUCTURE[loc]);
    }

    const sections = locData['_sections'] as string[];
    for (const sec of sections) {
      if (!locData[sec] || typeof locData[sec] !== 'object') {
        locData[sec] = { _enabled: deepClone(DEFAULT_ENABLED) };
      }

      const secData = locData[sec] as Record<string, unknown>;

      // Ensure _enabled exists
      if (!secData['_enabled'] || typeof secData['_enabled'] !== 'object') {
        secData['_enabled'] = deepClone(DEFAULT_ENABLED);
      }

      const enabled = secData['_enabled'] as Record<string, boolean>;

      for (const sh of SHIFTS) {
        // Ensure each shift array exists
        if (!Array.isArray(secData[sh])) secData[sh] = [];

        // Migrate string tasks to Task objects
        secData[sh] = (secData[sh] as unknown[]).map((t) =>
          typeof t === 'string' ? { text: t, requiresPhoto: false } : t,
        );

        // Ensure enabled flag exists for this shift
        if (enabled[sh] === undefined) {
          enabled[sh] = DEFAULT_ENABLED[sh as keyof ShiftEnabled] ?? false;
        }
      }
    }
  }

  return u as unknown as ChecklistConfig;
}

// ─── Log grouping helpers ────────────────────────────────────────────────────

type DateGroups<T> = { groups: Record<string, T>; keys: string[] };

/** Format a date as a human-readable group key (Today / Yesterday / day + date). */
function dateKey(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) {
    return `Today \u2014 ${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday \u2014 ${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
  }
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Groups checklist logs by date, then by location within each date.
 * Returns an ordered array of date keys and the grouped data.
 */
export function groupLogsByDate(
  logs: ChecklistLog[],
): DateGroups<Record<string, ChecklistLog[]>> {
  const groups: Record<string, Record<string, ChecklistLog[]>> = {};
  const keys: string[] = [];

  for (const log of logs) {
    const dk = dateKey(log.created_at);
    if (!groups[dk]) { groups[dk] = {}; keys.push(dk); }
    if (!groups[dk][log.location]) groups[dk][log.location] = [];
    groups[dk][log.location].push(log);
  }

  return { groups, keys };
}

/**
 * Groups issue logs by date.
 * Returns an ordered array of date keys and the grouped data.
 */
export function groupIssuesByDate(
  issues: IssueLog[],
): DateGroups<IssueLog[]> {
  const groups: Record<string, IssueLog[]> = {};
  const keys: string[] = [];

  for (const issue of issues) {
    const dk = dateKey(issue.created_at);
    if (!groups[dk]) { groups[dk] = []; keys.push(dk); }
    groups[dk].push(issue);
  }

  return { groups, keys };
}
