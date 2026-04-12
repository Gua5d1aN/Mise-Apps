/**
 * Design tokens for Mise Checklists.
 *
 * C  — colour palette
 * SH — neumorphic shadow system
 *
 * These are referenced directly in component style props rather than being
 * wrapped in CSSProperties objects, matching the pattern used throughout
 * the app for concise inline styles.
 *
 * @author Joshua Bosen
 */

/** Colour palette — the single source of truth for all colours in the app. */
export const C = {
  bg:      '#181530',  // Page background
  surface: '#1D1A38',  // Card / raised element surface
  well:    '#141228',  // Recessed / input surface
  pink:    '#E8297A',  // Primary brand accent (CTA buttons, labels)
  teal:    '#0DD8C4',  // Selection state, completion, success
  amber:   '#C4803A',  // Warning, photo required, submit anyway
  t1:      '#FFFFFF',  // Primary text
  t2:      '#C8C0E8',  // Secondary text — soft purple-white
  t3:      '#7A72A0',  // Tertiary text — muted purple
  t4:      '#4A4468',  // Quaternary text — near-invisible
} as const;

/** Shadow system — neumorphic light/dark shadows using the purple-navy palette. */
export const SH = {
  /** Large raised shadow — hero elements */
  up:     '6px 6px 14px rgba(0,0,0,0.62), -4px -4px 10px rgba(85,65,185,0.22)',
  /** Medium raised shadow — cards, task rows */
  upMd:   '5px 5px 12px rgba(0,0,0,0.58), -3px -3px 8px rgba(85,65,185,0.2)',
  /** Small raised shadow — chips, pills, action buttons */
  upSm:   '4px 4px 9px rgba(0,0,0,0.55), -2px -2px 6px rgba(85,65,185,0.18)',
  /** Large inset shadow — recessed inputs */
  down:   'inset 4px 4px 10px rgba(0,0,0,0.55), inset -2px -2px 7px rgba(85,65,185,0.18)',
  /** Small inset shadow — pressed state, wells */
  downSm: 'inset 3px 3px 7px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(85,65,185,0.15)',
  /** Teal glow — active/selected state */
  teal:   '4px 4px 12px rgba(10,185,168,0.5), -2px -2px 8px rgba(13,216,196,0.22)',
  /** Pink glow — primary CTA button */
  pink:   '5px 5px 14px rgba(185,15,75,0.65), -2px -2px 10px rgba(255,85,155,0.22)',
  /** Amber glow — amber CTA button */
  amber:  '4px 4px 10px rgba(185,100,20,0.4), -2px -2px 6px rgba(196,128,58,0.15)',
  /** Full-card outer frame shadow */
  frame:  '14px 14px 30px rgba(0,0,0,0.7), -8px -8px 20px rgba(85,65,185,0.18)',
} as const;
