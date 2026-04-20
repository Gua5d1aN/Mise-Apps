import type { ReactNode } from 'react';
import { C } from '../../styles/tokens';
export function SecLbl({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.t4, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '3px', height: '3px', background: C.t4, borderRadius: '50%', flexShrink: 0 }} />{children}</div>;
}
