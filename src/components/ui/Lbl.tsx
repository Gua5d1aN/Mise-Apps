/**
 * Lbl — pink uppercase label for form field groups.
 * @author Joshua Bosen
 */
import type { ReactNode } from 'react';
import { C } from '../../styles/tokens';

export function Lbl({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: '0.6rem',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: C.pink,
      opacity: 0.75,
      marginBottom: '0.6rem',
    }}>
      {children}
    </div>
  );
}
