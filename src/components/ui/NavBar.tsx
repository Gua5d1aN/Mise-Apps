/**
 * NavBar — top navigation bar used on most screens.
 *
 * Left: back chevron + label. Centre: Wordmark. Right: optional slot.
 *
 * @author Joshua Bosen
 */
import type { ReactNode } from 'react';
import { C } from '../../styles/tokens';
import { Wordmark } from './Wordmark';

interface NavBarProps {
  onBack: () => void;
  backLabel?: string;
  right?: ReactNode;
}

export function NavBar({ onBack, backLabel = 'Back', right = null }: NavBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
      <button
        onClick={onBack}
        type="button"
        style={{ background: 'none', border: 'none', color: C.t4, fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke={C.t4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {backLabel}
      </button>
      <Wordmark />
      <div style={{ width: '40px', textAlign: 'right' }}>{right}</div>
    </div>
  );
}
