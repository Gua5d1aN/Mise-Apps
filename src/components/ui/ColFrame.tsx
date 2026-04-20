import type { ReactNode } from 'react';
import { C } from '../../styles/tokens';
interface P { children: ReactNode; maxWidth?: string; }
export function ColFrame({ children, maxWidth = '640px' }: P) {
  return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', padding:'2rem 1.5rem' }}>
    <div style={{ maxWidth, width:'100%', margin:'0 auto', flex:1, display:'flex', flexDirection:'column' }}>{children}</div>
  </div>;
}
