/**
 * CSV export for checklist submission logs.
 * @author Joshua Bosen
 */
import type { ChecklistLog } from '../types';
const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export function toCSV(logs: ChecklistLog[]): string {
  const header = ['ID','Submitted At','Name','Location','Section','Shift','Completed','Total','Tasks (JSON)'].join(',');
  const rows = logs.map(r => [r.id,r.created_at,r.name,r.location,r.section,r.shift,r.completed,r.total,JSON.stringify(r.tasks)].map(cell).join(','));
  return [header, ...rows].join('\n');
}
export function downloadCSV(logs: ChecklistLog[]): void {
  const blob = new Blob([toCSV(logs)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `checklist_logs_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}
