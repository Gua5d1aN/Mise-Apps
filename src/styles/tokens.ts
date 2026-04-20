/**
 * Design tokens — colour palette and shadow system.
 * @author Joshua Bosen
 */
export const C = {
  bg:      '#181530',
  surface: '#1D1A38',
  well:    '#141228',
  pink:    '#E8297A',
  teal:    '#0DD8C4',
  amber:   '#C4803A',
  t1:      '#FFFFFF',
  t2:      '#C8C0E8',
  t3:      '#7A72A0',
  t4:      '#4A4468',
} as const;

export const SH = {
  up:     '6px 6px 14px rgba(0,0,0,0.62),-4px -4px 10px rgba(85,65,185,0.22)',
  upMd:   '5px 5px 12px rgba(0,0,0,0.58),-3px -3px 8px rgba(85,65,185,0.2)',
  upSm:   '4px 4px 9px rgba(0,0,0,0.55),-2px -2px 6px rgba(85,65,185,0.18)',
  down:   'inset 4px 4px 10px rgba(0,0,0,0.55),inset -2px -2px 7px rgba(85,65,185,0.18)',
  downSm: 'inset 3px 3px 7px rgba(0,0,0,0.5),inset -2px -2px 5px rgba(85,65,185,0.15)',
  teal:   '4px 4px 12px rgba(10,185,168,0.5),-2px -2px 8px rgba(13,216,196,0.22)',
  pink:   '5px 5px 14px rgba(185,15,75,0.65),-2px -2px 10px rgba(255,85,155,0.22)',
  amber:  '4px 4px 10px rgba(185,100,20,0.4),-2px -2px 6px rgba(196,128,58,0.15)',
  frame:  '14px 14px 30px rgba(0,0,0,0.7),-8px -8px 20px rgba(85,65,185,0.18)',
} as const;
