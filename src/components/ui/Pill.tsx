import { C, SH } from '../../styles/tokens';
interface P { label: string; active: boolean; onClick: () => void; }
export function Pill({ label, active, onClick }: P) {
  return <button className="nm-pill" onClick={onClick} type="button" aria-pressed={active}
    style={{ background:active?C.teal:C.surface, boxShadow:active?SH.teal:SH.upSm, border:'none', borderRadius:'12px', padding:'0.75rem 0.5rem', fontSize:'0.78rem', fontWeight:active?600:500, color:active?'#0C0A22':C.t3, cursor:'pointer', textAlign:'center', width:'100%', transition:'all 0.18s', fontFamily:'inherit' }}>
    {label}
  </button>;
}
