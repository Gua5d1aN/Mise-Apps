/**
 * Application-wide constants for Mise Checklists.
 * @author Joshua Bosen
 */
import type { Shift, ShiftEnabled } from '../types';

export const STRUCTURE: Record<string, string[]> = {
  Kitchen: ['Grill', 'Larder', 'Pans', 'Fryer', 'Overnight Only'],
  FOH:     ['Floor', 'Host / Reception', 'Terrace'],
  Bar:     ['Crane Bar', 'Back Bar', 'LVL1 Bar'],
  IRD:     ['IRD'],
};
export const LOCS: string[] = Object.keys(STRUCTURE);
export const SHIFTS: Shift[] = ['Opening', 'Closing', 'Overnight', 'Weekly', 'Bi-Weekly', 'Monthly'];
export const DEFAULT_ENABLED: ShiftEnabled = {
  Opening: true, Closing: true, Overnight: false, Weekly: false, 'Bi-Weekly': false, Monthly: false,
};
// Admin password gate removed in Phase 3 — replaced by PIN-based auth.
