import type { ReactNode } from 'react';
import { C, SH } from '../../styles/tokens';
interface P { children: ReactNode; onClick: () => void; variant?: 'default'|'teal'|'danger'; disabled?: boolean; }
const vc: Record<string,string> = { default:C.t3, teal:C.teal, danger:C.pink };
export function ActionBtn({ children, onClick, variant='default', disabled=false }: P) {
  return <button className="nm-btn-sm" onClick={onClick} disabled={disabled} type="button"
    style={{ background:C.surface, boxShadow:SH.upSm, border:'none', borderRadius:'10px', padding:'0.5rem 0.875rem', fontSize:'0.72rem', fontWeight:500, color:vc[variant]??C.t3, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.4:1, fontFamily:'inherit', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.15s' }}>
    {children}
  </button>;
}
