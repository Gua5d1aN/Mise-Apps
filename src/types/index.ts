/**
 * Core TypeScript types for Mise Checklists.
 * @author Joshua Bosen
 */
export type Shift = 'Opening'|'Closing'|'Overnight'|'Weekly'|'Bi-Weekly'|'Monthly';
export type ShiftEnabled = Record<Shift, boolean>;

export interface Task {
  text: string;
  requiresPhoto: boolean;
  examplePhotoUrl?: string | null;
}
export interface SectionConfig { _enabled: ShiftEnabled; [shift: string]: Task[] | ShiftEnabled; }
export interface LocationConfig { _sections: string[]; [section: string]: SectionConfig | string[]; }
export type ChecklistConfig = Record<string, LocationConfig>;

export interface TaskLogEntry { task: string; done: boolean; requiresPhoto: boolean; photoUrl: string | null; }
export interface ChecklistLog { id: number; created_at: string; org_id: string; name: string; location: string; section: string; shift: string; completed: number; total: number; tasks: TaskLogEntry[]; }
export type ChecklistLogInsert = Omit<ChecklistLog, 'id' | 'created_at' | 'org_id'>;

export interface IssueLog { id: number; created_at: string; org_id: string; name: string; item_name: string; photo_url: string | null; resolved: boolean; resolved_at: string | null; }
export type IssueLogInsert = Omit<IssueLog, 'id' | 'created_at' | 'org_id' | 'resolved' | 'resolved_at'>;

export interface Organisation { id: string; name: string; slug: string; plan: 'starter'|'pro'|'studio'|'enterprise'; created_at: string; }

export type AppView = 'loading'|'welcome'|'home'|'checklist'|'success'|'issueLog'|'issueSuccess'|'adminLogin'|'adminSetup'|'admin';
export type AdminTab = 'logs'|'results'|'issues'|'edit'|'access';
export type DateFilter = 'All'|'Today'|'Last 7 days'|'Last 30 days';
