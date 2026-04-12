/**
 * BtnAmber — amber-outlined CTA used when submitting an incomplete checklist.
 *
 * Signals to staff that submission is possible but the checklist is not fully done.
 * The amber colour distinguishes it clearly from the pink primary submit path.
 *
 * @author Joshua Bosen
 */
import type { ReactNode } from 'react';
import { C, SH } from '../../styles/tokens';

interface BtnAmberProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function BtnAmber({ children, onClick, disabled = false }: BtnAmberProps) {
  return (
    <button
      className="nm-btn-amber"
      onClick={onClick}
      disabled={disabled}
      type="button"
      style={{
        width: '100%',
        background: C.surface,
        boxShadow: SH.upSm,
        border: '1px solid rgba(196,128,58,0.3)',
        borderRadius: '16px',
        padding: '1rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: C.amber,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.18s',
      }}
    >
      {children}
    </button>
  );
}
