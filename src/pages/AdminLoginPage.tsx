/**
 * AdminLoginPage — PIN-based admin login with name selector and numpad.
 * @author Joshua Bosen
 */
import { useState, useEffect } from 'react';
import { C, SH } from '../styles/tokens';
import { Frame, NavBar, BtnPink } from '../components/ui';
import { fetchAdminNames, verifyPin } from '../lib/auth';
import type { AdminSession } from '../lib/auth';
interface P { onSuccess: (session: AdminSession) => void; onBack: () => void; onSetup: () => void; }
const PIN_LENGTH = 6;
export function AdminLoginPage({ onSuccess, onBack, onSetup }: P) {
  const [names, setNames] = useState<string[]>([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [selectedName, setSelectedName] = useState('');
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { fetchAdminNames().then(setNames).catch(()=>setNames([])).finally(()=>setNamesLoading(false)); }, []);
  useEffect(() => { if (pin.length===PIN_LENGTH&&selectedName) void handleVerify(); }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps
  function addDigit(d: string) { if(pin.length>=PIN_LENGTH||verifying)return; setError(''); setPin(p=>p+d); }
  function removeDigit() { setPin(p=>p.slice(0,-1)); setError(''); }
  async function handleVerify() {
    if(!selectedName||pin.length<4)return;
    setVerifying(true); setError('');
    try {
      const session = await verifyPin(pin);
      if (session) { onSuccess(session); } else { setError('Incorrect PIN. Try again.'); setPin(''); }
    } catch { setError('Connection error. Check your network.'); setPin(''); }
    finally { setVerifying(false); }
  }
  const dots = Array.from({length:PIN_LENGTH},(_,i)=>i<pin.length);
  const btnStyle = (disabled=false) => ({ background:C.surface, boxShadow:SH.upMd, border:'none', borderRadius:'14px', padding:'1.1rem', fontSize:'1.4rem', fontWeight:500, color:C.t1, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', transition:'all 0.12s', opacity:disabled?0.5:1 });
  return <Frame>
    <NavBar onBack={onBack}/>
    <div style={{width:'64px',height:'64px',borderRadius:'50%',background:C.surface,boxShadow:SH.up,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem'}}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke={C.t3} strokeWidth="1.75"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={C.t3} strokeWidth="1.75" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill={C.t3}/></svg>
    </div>
    <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
      <div style={{fontSize:'1.3rem',fontWeight:600,color:C.t1,marginBottom:'0.35rem'}}>Admin Access</div>
      <div style={{fontSize:'0.75rem',color:C.t4}}>{!selectedName?'Select your name to continue':`Enter your PIN, ${selectedName}`}</div>
    </div>
    {!selectedName&&(namesLoading
      ?<p style={{textAlign:'center',color:C.t4,fontSize:'0.875rem',padding:'1rem 0'}}>Loading…</p>
      :names.length===0
        ?<div style={{textAlign:'center',padding:'1rem 0'}}><p style={{color:C.t4,fontSize:'0.8rem',marginBottom:'1.25rem',lineHeight:1.6}}>No admin accounts found for this venue.</p><BtnPink onClick={onSetup}>First time setup →</BtnPink></div>
        :<div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>{names.map(n=>(
          <button key={n} onClick={()=>{setSelectedName(n);setPin('');setError('');}} type="button"
            style={{background:C.surface,boxShadow:SH.upMd,border:'none',borderRadius:'14px',padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'all 0.18s',width:'100%'}}>
            <span style={{fontSize:'0.95rem',fontWeight:500,color:C.t1}}>{n}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={C.t4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ))}</div>
    )}
    {selectedName&&<div>
      <button onClick={()=>{setSelectedName('');setPin('');setError('');}} type="button" style={{background:'none',border:'none',color:C.t4,fontSize:'0.72rem',cursor:'pointer',fontFamily:'inherit',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'4px'}}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke={C.t4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Not {selectedName}?
      </button>
      <div style={{display:'flex',justifyContent:'center',gap:'0.875rem',marginBottom:'2rem'}}>
        {dots.map((filled,i)=><div key={i} style={{width:'14px',height:'14px',borderRadius:'50%',background:filled?C.teal:'transparent',boxShadow:filled?SH.teal:SH.downSm,border:filled?'none':`2px solid ${C.t4}`,transition:'all 0.15s'}}/>)}
      </div>
      {error&&<p style={{textAlign:'center',fontSize:'0.75rem',color:C.pink,marginBottom:'1.25rem'}}>{error}</p>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.625rem',marginBottom:'0.625rem'}}>
        {['1','2','3','4','5','6','7','8','9'].map(d=><button key={d} onClick={()=>addDigit(d)} type="button" disabled={verifying} style={btnStyle(verifying)}>{d}</button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.625rem'}}>
        <div/>
        <button onClick={()=>addDigit('0')} type="button" disabled={verifying} style={btnStyle(verifying)}>0</button>
        <button onClick={removeDigit} type="button" disabled={verifying||pin.length===0} style={{...btnStyle(verifying||pin.length===0),fontSize:'1.1rem',color:pin.length>0?C.t2:C.t4,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
      </div>
      {pin.length>=4&&pin.length<PIN_LENGTH&&<div style={{marginTop:'1.25rem'}}><BtnPink onClick={handleVerify} disabled={verifying}>{verifying?'Verifying…':'Enter Admin →'}</BtnPink></div>}
      {verifying&&<p style={{textAlign:'center',fontSize:'0.72rem',color:C.t4,marginTop:'1rem'}}>Verifying…</p>}
    </div>}
  </Frame>;
}
