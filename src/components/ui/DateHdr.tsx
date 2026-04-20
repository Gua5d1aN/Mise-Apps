import { C } from '../../styles/tokens';
interface P { label: string; count?: number | null; }
export function DateHdr({ label, count=null }: P) {
  return <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.875rem', marginTop:'0.25rem' }}>
    <span style={{ fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:C.pink, whiteSpace:'nowrap', opacity:0.85 }}>{label}</span>
    <div style={{ flex:1, height:'1px', background:'#2A2648' }} />
    {count != null && <span style={{ fontSize:'0.62rem', color:C.t4, whiteSpace:'nowrap' }}>{count} {count===1?'submission':'submissions'}</span>}
  </div>;
}
