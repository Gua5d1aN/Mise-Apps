/**
 * Centralised inline-style tokens for Mise Checklists.
 *
 * Design language: dark purple/navy base, teal selection accent, pink/magenta
 * brand accent, Clash Grotesk typeface. Approved in design review April 2026.
 *
 * Palette:
 *   Background:     #181530  — deep navy/purple
 *   Surface:        #1D1A38  — raised card surface
 *   Surface deep:   #141228  — recessed input surface
 *   Border:         #2E2A50  — subtle surface boundary
 *   Text primary:   #FFFFFF
 *   Text secondary: #7A72A0  — muted purple-grey
 *   Text label:     #E8297A  — pink, low opacity on labels
 *   Accent teal:    #0DD8C4  — selection state, active indicators
 *   Accent pink:    #E8297A  — primary actions, brand mark
 *   Success:        #4ade80
 *   Warning:        #f59e0b
 *   Danger:         #ef4444
 *
 * All components import from here — visual changes propagate everywhere from
 * one place. Phase 4 replaces this with Tailwind CSS utility classes.
 *
 * @author Joshua Bosen
 */
import type { CSSProperties } from 'react';

// ─── Shared Layout ────────────────────────────────────────────────────────────

/** Full-page dark base. Applied to every view's root element. */
export const page: CSSProperties = {
  minHeight: '100vh',
  background: '#181530',
  color: '#FFFFFF',
  fontFamily: "'Clash Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

/** Centred column layout — home, success, modal-style screens. */
export const center: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1.25rem',
};

/** Left-aligned column — checklist and admin screens. */
export const col: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem 1.25rem',
};

/** Constrained card width for centred views. */
export const card: CSSProperties = {
  width: '100%',
  maxWidth: '360px',
};

/** Inner container for the checklist view. */
export const inner: CSSProperties = {
  maxWidth: '360px',
  width: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
};

/** Wider container for the admin panel. */
export const adminWrap: CSSProperties = {
  maxWidth: '640px',
  width: '100%',
  margin: '0 auto',
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const eyebrow: CSSProperties = {
  fontSize: '.65rem',
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'rgba(232, 41, 122, 0.65)',
  marginBottom: '.4rem',
  textAlign: 'center',
};

export const heading: CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#FFFFFF',
  letterSpacing: '-.01em',
};

export const lbl: CSSProperties = {
  fontSize: '.6rem',
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: 'rgba(232, 41, 122, 0.7)',
  display: 'block',
  marginBottom: '.6rem',
};

export const sectionLbl: CSSProperties = {
  fontSize: '.6rem',
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: 'rgba(232, 41, 122, 0.7)',
  marginBottom: '.75rem',
  display: 'block',
};

// ─── Form Fields ──────────────────────────────────────────────────────────────

/** Recessed input — carved into the surface with an inset shadow. */
export const field: CSSProperties = {
  width: '100%',
  background: '#141228',
  boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.58), inset -2px -2px 7px rgba(85,65,185,0.18)',
  border: 'none',
  borderRadius: '14px',
  padding: '.875rem 1rem',
  color: '#FFFFFF',
  fontSize: '.875rem',
  fontFamily: 'inherit',
  outline: 'none',
};

export const fieldSm: CSSProperties = {
  background: '#141228',
  border: '1px solid #2E2A50',
  borderRadius: '.75rem',
  padding: '.5rem .75rem',
  color: '#FFFFFF',
  fontSize: '.8rem',
  fontFamily: 'inherit',
  outline: 'none',
  flex: '1',
};

// ─── Grid & Stack ─────────────────────────────────────────────────────────────

export const grid2: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '.6rem',
};

export const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '.75rem',
};

export const rowSB: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1.75rem',
};

// ─── Buttons ──────────────────────────────────────────────────────────────────

/** Primary action — pink/magenta fill with glow shadow. */
export const btnP: CSSProperties = {
  width: '100%',
  padding: '1rem',
  borderRadius: '16px',
  background: '#E8297A',
  color: '#FFFFFF',
  fontSize: '.875rem',
  fontWeight: '500',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '5px 5px 14px rgba(185,15,75,0.55), -2px -2px 10px rgba(255,85,155,0.15)',
  fontFamily: 'inherit',
};

/** Ghost button — subtle border, muted text. */
export const btnG: CSSProperties = {
  padding: '.625rem 1.25rem',
  borderRadius: '.875rem',
  border: '1px solid #2E2A50',
  background: 'transparent',
  color: '#7A72A0',
  fontSize: '.8rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

/** Download/export button — teal border. */
export const btnDl: CSSProperties = {
  padding: '.625rem 1.25rem',
  borderRadius: '.875rem',
  border: '1px solid rgba(13,216,196,0.4)',
  background: 'transparent',
  color: '#0DD8C4',
  fontSize: '.8rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

/** Danger button — for destructive actions. */
export const btnDanger: CSSProperties = {
  padding: '.625rem 1.25rem',
  borderRadius: '.875rem',
  border: '1px solid rgba(239,68,68,0.4)',
  background: 'transparent',
  color: '#ef4444',
  fontSize: '.8rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

/** Back navigation — minimal, left-aligned. */
export const backBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#4A4468',
  fontSize: '.85rem',
  cursor: 'pointer',
  padding: '.25rem 0',
  textAlign: 'left',
  display: 'block',
  marginBottom: '1.5rem',
  fontFamily: 'inherit',
};

/** Very low-contrast admin link — visible to those who look, invisible otherwise. */
export const adminLink: CSSProperties = {
  marginTop: '2.5rem',
  fontSize: '.7rem',
  color: '#2E2A50',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'center',
  fontFamily: 'inherit',
};

// ─── Pill Toggle Buttons ──────────────────────────────────────────────────────

/**
 * Raised pill — floats off the surface via drop shadow.
 * Unselected state. Becomes teal-filled when active (pillOn).
 */
export const pillBase: CSSProperties = {
  width: '100%',
  padding: '.875rem .75rem',
  borderRadius: '12px',
  fontSize: '.78rem',
  fontWeight: '500',
  border: '1px solid transparent',
  background: '#1D1A38',
  boxShadow: '5px 5px 11px rgba(0,0,0,0.58), -3px -3px 8px rgba(85,65,185,0.2)',
  color: '#7A72A0',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.18s ease',
  fontFamily: 'inherit',
};

/**
 * Selected pill — solid teal fill, dark text for legibility.
 * Dark navy text on teal reads clearly without the harshness of white on teal.
 */
export const pillOn: CSSProperties = {
  background: '#0DD8C4',
  color: '#181530',
  borderColor: '#0DD8C4',
  boxShadow: '0 0 16px rgba(13,216,196,0.35)',
};

// ─── Tab Navigation ───────────────────────────────────────────────────────────

export const tabRow: CSSProperties = {
  display: 'flex',
  gap: '.5rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
};

export const tab: CSSProperties = {
  padding: '.5rem 1rem',
  borderRadius: '.625rem',
  fontSize: '.85rem',
  fontWeight: '500',
  border: '1px solid #2E2A50',
  background: '#1D1A38',
  color: '#7A72A0',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const tabOn: CSSProperties = {
  background: '#0DD8C4',
  color: '#181530',
  borderColor: '#0DD8C4',
};

// ─── Chip Filters ─────────────────────────────────────────────────────────────

export const chipRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '.375rem',
  marginBottom: '.75rem',
};

export const chip: CSSProperties = {
  padding: '.375rem .75rem',
  borderRadius: '.5rem',
  fontSize: '.75rem',
  fontWeight: '500',
  border: '1px solid #2E2A50',
  background: '#1D1A38',
  color: '#7A72A0',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const chipOn: CSSProperties = {
  background: '#0DD8C4',
  color: '#181530',
  borderColor: '#0DD8C4',
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export const pbar: CSSProperties = {
  height: '3px',
  background: '#2E2A50',
  borderRadius: '2px',
  overflow: 'hidden',
  marginBottom: '1.25rem',
};

export const pctRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '.7rem',
  color: '#4A4468',
  marginBottom: '.5rem',
};

// ─── Task Items ───────────────────────────────────────────────────────────────

export const tasksWrap: CSSProperties = {
  flex: '1',
  marginBottom: '1.25rem',
};

/** Task row — raised card surface, floats above background. */
export const taskBtn: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  borderRadius: '14px',
  border: '1px solid #2E2A50',
  background: '#1D1A38',
  boxShadow: '4px 4px 10px rgba(0,0,0,0.45), -2px -2px 7px rgba(85,65,185,0.15)',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
};

/** Dimmed task row once fully completed. */
export const taskBtnDone: CSSProperties = {
  background: '#161330',
  borderColor: '#201D3A',
  boxShadow: 'none',
  opacity: 0.65,
};

/** Task text — flex-fills available width. */
export const taskText: CSSProperties = {
  fontSize: '.875rem',
  lineHeight: '1.45',
  flex: '1',
  textAlign: 'left',
};

/** Completion circle — unchecked. */
export const circle: CSSProperties = {
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  border: '2px solid #4A4468',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

/** Completion circle — checked/teal filled. */
export const circleOn: CSSProperties = {
  background: '#0DD8C4',
  borderColor: '#0DD8C4',
};

/** Photo upload button — amber/warm accent. */
export const uploadBtn: CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(245,158,11,0.5)',
  color: '#f59e0b',
  borderRadius: '.625rem',
  padding: '.375rem .875rem',
  fontSize: '.75rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ─── Edit Task Row (Admin) ────────────────────────────────────────────────────

export const editRow: CSSProperties = {
  display: 'flex',
  gap: '.5rem',
  alignItems: 'center',
  marginBottom: '.5rem',
};

export const editInput: CSSProperties = {
  flex: '1',
  background: '#141228',
  border: '1px solid #2E2A50',
  borderRadius: '.625rem',
  padding: '.75rem',
  fontSize: '.875rem',
  color: '#FFFFFF',
  fontFamily: 'inherit',
  outline: 'none',
};

export const photoToggle: CSSProperties = {
  background: 'none',
  border: '1px solid #2E2A50',
  borderRadius: '.5rem',
  padding: '.35rem .5rem',
  fontSize: '.85rem',
  cursor: 'pointer',
  flexShrink: 0,
};

export const photoToggleOn: CSSProperties = {
  borderColor: '#f59e0b',
  background: 'rgba(245, 158, 11, 0.12)',
};

export const rmBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#4A4468',
  fontSize: '1.5rem',
  cursor: 'pointer',
  width: '2rem',
  flexShrink: 0,
  lineHeight: '1',
};

export const addBtn: CSSProperties = {
  width: '100%',
  padding: '.875rem',
  borderRadius: '12px',
  border: '1px dashed #2E2A50',
  background: 'transparent',
  color: '#4A4468',
  fontSize: '.875rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ─── Admin Log Cards ──────────────────────────────────────────────────────────

export const logCard: CSSProperties = {
  width: '100%',
  background: '#1D1A38',
  border: '1px solid #2E2A50',
  borderRadius: '14px',
  padding: '1rem',
  textAlign: 'left',
  marginBottom: '.5rem',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '.75rem',
};

export const logCardSelected: CSSProperties = {
  borderColor: 'rgba(239,68,68,0.5)',
  background: '#261525',
};

export const logExpand: CSSProperties = {
  marginTop: '.75rem',
  paddingTop: '.75rem',
  borderTop: '1px solid #2E2A50',
};

// ─── Admin Results ────────────────────────────────────────────────────────────

export const statBox: CSSProperties = {
  background: '#1D1A38',
  border: '1px solid #2E2A50',
  borderRadius: '14px',
  padding: '1rem 1.25rem',
  flex: '1',
  minWidth: '100px',
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const sicon: CSSProperties = {
  width: '4rem',
  height: '4rem',
  borderRadius: '50%',
  background: '#1D1A38',
  border: '1px solid #2E2A50',
  boxShadow: '0 0 24px rgba(13,216,196,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: '1.5rem',
};

export const checkbox: CSSProperties = {
  width: '1.1rem',
  height: '1.1rem',
  accentColor: '#0DD8C4',
  cursor: 'pointer',
  flexShrink: 0,
  marginTop: '.15rem',
};
