/**
 * Frame — centred card container used for focused screens.
 *
 * Renders a neumorphic card with a small pink accent bar at the top centre.
 * Used for: home, checklist setup, success, issue log, admin login.
 *
 * @author Joshua Bosen
 */
import type { ReactNode } from 'react';
import { C, SH } from '../../styles/tokens';

interface FrameProps {
  children: ReactNode;
  maxWidth?: string;
}

export function Frame({ children, maxWidth = '360px' }: FrameProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
    }}>
      <div style={{
        background: C.bg,
        borderRadius: '2.25rem',
        boxShadow: SH.frame,
        padding: '2rem 1.5rem',
        width: '100%',
        maxWidth,
        position: 'relative',
      }}>
        {/* Pink accent bar at top centre */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '52px',
          height: '3px',
          background: C.pink,
          borderRadius: '0 0 4px 4px',
        }} />
        {children}
      </div>
    </div>
  );
}
