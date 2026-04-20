import { C, SH } from '../../styles/tokens';
interface P { label: string; active: boolean; onClick: () => void; }
export function Chip({ label, active, onClick }: P) {
  return <button className="nm-pill" onClick={onClick} type="button" aria-pressed={active}
    style={{ background:active?C.teal:C.surface, boxShadow:active?SH.teal:SH.upSm, border:'none', borderRadius:'10px', padding:'0.5rem 0.875rem', fontSize:'0.72rem', fontWeight:active?600:500, color:active?'#0C0A22':C.t3, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', fontFamily:'inherit' }}>
    {label}
  </button>;
}
