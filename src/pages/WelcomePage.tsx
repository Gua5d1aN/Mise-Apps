/**
 * WelcomePage — top-level landing screen.
 * @author Joshua Bosen
 */
import { C, SH } from '../styles/tokens';
interface P { onChecklists: () => void; onMaintenanceLog: () => void; onAdmin: () => void; }
export function WelcomePage({ onChecklists, onMaintenanceLog, onAdmin }: P) {
  const items = [
    { title:'Daily Checklists', desc:'Opening, closing & shift tasks', icon:<svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3L13 5" stroke={C.pink} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>, action:onChecklists },
    { title:'Maintenance Logs', desc:'Log equipment issues & repairs', icon:<svg width="17" height="17" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke={C.pink} strokeWidth="1.75"/><path d="M8 2.5v1.5M8 12v1.5M2.5 8H4M12 8h1.5" stroke={C.pink} strokeWidth="1.5" strokeLinecap="round"/></svg>, action:onMaintenanceLog },
  ];
  return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem 1.25rem' }}>
    <div style={{ background:C.bg, borderRadius:'2.25rem', boxShadow:SH.frame, padding:'2.5rem 1.5rem 2rem', width:'100%', maxWidth:'360px', position:'relative' }}>
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'52px', height:'3px', background:C.pink, borderRadius:'0 0 4px 4px' }} />
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ fontFamily:"Georgia,'Book Antiqua',Palatino,serif", fontStyle:'italic', fontSize:'3rem', color:C.t1, letterSpacing:'-0.03em', lineHeight:1, marginBottom:'0.5rem', display:'flex', alignItems:'flex-end', gap:'0.5rem' }}>
          mise <div style={{ width:'7px', height:'7px', background:C.pink, borderRadius:'1px', transform:'rotate(45deg)', marginBottom:'0.55rem', flexShrink:0, boxShadow:'2px 2px 5px rgba(185,15,75,0.5)' }} />
        </div>
        <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:C.pink, opacity:0.65 }}>Everything in its place.</div>
      </div>
      <div style={{ height:'1px', background:'#201D3C', marginBottom:'1.25rem' }} />
      <div style={{ fontSize:'0.6rem', letterSpacing:'0.16em', textTransform:'uppercase', color:C.t4, marginBottom:'0.875rem' }}>Select your task</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {items.map(item => (
          <button key={item.title} className="nm-card" onClick={item.action} type="button"
            style={{ background:C.surface, boxShadow:SH.upMd, border:'none', borderRadius:'1rem', padding:'1.1rem 1.2rem', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.875rem', transition:'all 0.18s', width:'100%' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(232,41,122,0.1)', boxShadow:'3px 3px 8px rgba(0,0,0,0.5),-2px -2px 6px rgba(85,65,185,0.15)', border:'1px solid rgba(232,41,122,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.icon}</div>
            <div style={{ flex:1 }}><p style={{ fontSize:'0.9rem', fontWeight:600, color:C.t1, marginBottom:'0.15rem' }}>{item.title}</p><p style={{ fontSize:'0.72rem', color:C.t3 }}>{item.desc}</p></div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, opacity:0.4 }}><path d="M6 4l4 4-4 4" stroke={C.pink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}
        <div style={{ background:'rgba(29,26,56,0.6)', boxShadow:SH.upSm, borderRadius:'1rem', padding:'1.1rem 1.2rem', display:'flex', alignItems:'center', gap:'0.875rem', opacity:0.45 }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', boxShadow:SH.downSm, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#3A3860" strokeWidth="1.5"/><path d="M5 7h6M5 9.5h4" stroke="#3A3860" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{ flex:1 }}><p style={{ fontSize:'0.9rem', fontWeight:600, color:'#6A6288', marginBottom:'0.15rem' }}>Staff Training</p><p style={{ fontSize:'0.72rem', color:'#3A3658' }}>Equipment sign-offs & competencies</p></div>
          <div style={{ fontSize:'0.58rem', letterSpacing:'0.1em', textTransform:'uppercase', color:C.t4, background:C.well, boxShadow:SH.downSm, borderRadius:'100px', padding:'0.25rem 0.65rem' }}>Soon</div>
        </div>
      </div>
      <div style={{ marginTop:'2rem', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:'1.25rem' }}>
        <button onClick={onAdmin} type="button" style={{ background:'none', border:'none', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#252240', cursor:'pointer', fontFamily:'inherit' }}>Admin</button>
      </div>
    </div>
  </div>;
}
