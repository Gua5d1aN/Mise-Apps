/**
 * CSV export utilities for checklist submission logs.
 *
 * All processing is client-side — no server call is required. The resulting
 * CSV file is generated in memory and downloaded directly in the browser.
 *
 * @author Joshua Bosen
 */
import type { ChecklistLog } from '../types';

/** Column order for the exported CSV file. */
const CSV_HEADERS = [
  'ID',
  'Submitted At',
  'Name',
  'Location',
  'Section',
  'Shift',
  'Completed',
  'Total',
  'Tasks (JSON)',
];

/**
 * Wraps a value in double quotes and escapes any internal double quotes.
 * RFC 4180 compliant cell serialisation.
 *
 * @param value - The raw cell value.
 * @returns A CSV-safe quoted string.
 */
function cell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/**
 * Converts an array of checklist logs into a CSV-formatted string.
 *
 * @param logs - The logs to serialise.
 * @returns A UTF-8 CSV string with a header row followed by one data row per log.
 */
export function toCSV(logs: ChecklistLog[]): string {
  const header = CSV_HEADERS.join(',');

  const rows = logs.map((log) =>
    [
      log.id,
      log.created_at,
      log.name,
      log.location,
      log.section,
      log.shift,
      log.completed,
      log.total,
      JSON.stringify(log.tasks),
    ]
      .map(cell)
      .join(','),
  );

  return [header, ...rows].join('\n');
}

/**
 * Triggers a browser file download of all logs as a CSV.
 * The filename includes today's date (YYYY-MM-DD) for easy identification.
 *
 * @param logs - The logs to export.
 */
export function downloadCSV(logs: ChecklistLog[]): void {
  const blob = new Blob([toCSV(logs)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `checklist_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  // Release the object URL immediately after triggering download to free memory
  URL.revokeObjectURL(url);
}
