import type { ReactNode } from 'react';
import { C, SH } from '../../styles/tokens';
interface P { children: ReactNode; onClick: () => void; disabled?: boolean; }
export function BtnAmber({ children, onClick, disabled=false }: P) {
  return <button className="nm-btn-amber" onClick={onClick} disabled={disabled} type="button"
    style={{ width:'100%', background:C.surface, boxShadow:SH.upSm, border:'1px solid rgba(196,128,58,0.3)', borderRadius:'16px', padding:'1rem', fontSize:'0.875rem', fontWeight:500, color:C.amber, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all 0.18s' }}>
    {children}
  </button>;
}
