/**
 * Core TypeScript types for Mise Checklists.
 *
 * All shared data shapes live here. Keeping types centralised means a schema
 * change only needs to be updated in one place — TypeScript will then surface
 * every location in the codebase that needs updating.
 *
 * @author Joshua Bosen
 * @module types
 */

// ─── Shift Types ──────────────────────────────────────────────────────────────

/** All supported shift types. Expanded beyond Opening/Closing for full flexibility. */
export type Shift = 'Opening' | 'Closing' | 'Overnight' | 'Weekly' | 'Bi-Weekly' | 'Monthly';

/** Per-shift enabled flags for a section. Controls which shifts appear on the home screen. */
export type ShiftEnabled = Record<Shift, boolean>;

// ─── Task & Configuration Types ───────────────────────────────────────────────

/**
 * A single task within a checklist section.
 * Tasks are stored in Supabase as part of the checklist_config JSONB column.
 */
export interface Task {
  /** The description shown to staff when completing the checklist. */
  text: string;
  /**
   * When true, the task cannot be marked fully complete until a photo is
   * uploaded. Used for compliance-sensitive steps (e.g. temp logs, cleanliness).
   */
  requiresPhoto: boolean;
  /**
   * Optional URL of an admin-uploaded reference photo.
   * When set, staff see a "See example →" button that opens a lightbox.
   */
  examplePhotoUrl?: string | null;
}

/**
 * Configuration data for a single section (e.g. Grill, Crane Bar).
 * Stores per-shift task arrays and a map of which shifts are enabled.
 *
 * The _enabled map controls which shifts are visible to staff on the home screen.
 * Opening and Closing are enabled by default; others are opt-in.
 */
export interface SectionConfig {
  _enabled: ShiftEnabled;
  [shift: string]: Task[] | ShiftEnabled;
}

/**
 * Configuration data for a single location (e.g. Kitchen, Bar).
 * Stores the ordered list of sections plus each section's config.
 *
 * _sections is the source of truth for section order and names.
 * Dynamic section management (add/remove) in the admin edit panel
 * updates _sections and adds/removes the corresponding SectionConfig key.
 */
export interface LocationConfig {
  _sections: string[];
  [section: string]: SectionConfig | string[];
}

/**
 * The full checklist configuration stored in Supabase.
 * Structure: Location → LocationConfig (which contains Section → SectionConfig)
 *
 * Phase 4 note: Fetched per-organisation in the commercial version,
 * allowing each venue to define their own structure entirely.
 */
export type ChecklistConfig = Record<string, LocationConfig>;

// ─── Checklist Log Types ──────────────────────────────────────────────────────

/**
 * A single task entry stored within a submitted checklist log.
 * This is a snapshot of the task at submission time — editing the task
 * text later in admin does not retroactively change historical logs.
 */
export interface TaskLogEntry {
  task: string;
  done: boolean;
  requiresPhoto: boolean;
  photoUrl: string | null;
}

/**
 * A complete checklist submission row from the checklist_logs table.
 *
 * Phase 2 note: org_id will be added here for multi-tenant scoping.
 */
export interface ChecklistLog {
  id: number;
  created_at: string;
  name: string;
  location: string;
  section: string;
  shift: string;
  completed: number;
  total: number;
  tasks: TaskLogEntry[];
}

/** The insert shape for a new checklist log — omits server-generated fields. */
export type ChecklistLogInsert = Omit<ChecklistLog, 'id' | 'created_at'>;

// ─── Maintenance / Issue Log Types ────────────────────────────────────────────

/**
 * A maintenance issue report row from the issue_logs table.
 * Staff submit these from the Maintenance Logs flow on the welcome screen.
 *
 * Phase 2 note: org_id will be added for multi-tenant scoping.
 */
export interface IssueLog {
  id: number;
  created_at: string;
  name: string;
  item_name: string;
  photo_url: string | null;
}

/** The insert shape for a new issue log. */
export type IssueLogInsert = Omit<IssueLog, 'id' | 'created_at'>;

// ─── App Navigation Types ─────────────────────────────────────────────────────

/**
 * All possible views the app can render.
 * Using a union type means TypeScript will warn if a new view is added
 * but not handled in the App's render block.
 */
export type AppView =
  | 'loading'
  | 'welcome'
  | 'home'
  | 'checklist'
  | 'success'
  | 'issueLog'
  | 'issueSuccess'
  | 'adminLogin'
  | 'admin';

/** The four tabs available in the admin panel. */
export type AdminTab = 'logs' | 'results' | 'issues' | 'edit';

/** Date filter options used in both Results and Issues views. */
export type DateFilter = 'All' | 'Today' | 'Last 7 days' | 'Last 30 days';
