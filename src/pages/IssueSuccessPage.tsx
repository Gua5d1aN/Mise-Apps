/** @author Joshua Bosen */
import { C } from '../styles/tokens';
import { Frame, Wordmark, BtnPink, CheckBig } from '../components/ui';
interface P { staffName:string; itemName:string; onHome:()=>void; }
export function IssueSuccessPage({ staffName,itemName,onHome }: P) {
  return <Frame>
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'2rem'}}><Wordmark size="1.5rem"/></div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'2rem'}}>
      <div style={{width:'90px',height:'90px',borderRadius:'50%',background:C.teal,boxShadow:'8px 8px 20px rgba(10,185,168,0.55),-4px -4px 14px rgba(13,216,196,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><CheckBig/></div>
    </div>
    <div style={{textAlign:'center',marginBottom:'2rem'}}>
      <div style={{fontSize:'1.75rem',fontWeight:600,color:C.t1,marginBottom:'0.5rem',letterSpacing:'-0.02em'}}>Issue logged.</div>
      <div style={{fontSize:'0.8rem',color:C.t3}}><span style={{color:C.t2,fontWeight:500}}>{itemName}</span> logged by {staffName}.</div>
    </div>
    <BtnPink onClick={onHome}>Back to Home</BtnPink>
  </Frame>;
}
