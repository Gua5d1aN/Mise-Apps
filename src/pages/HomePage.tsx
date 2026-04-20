/** @author Joshua Bosen */
import { C } from '../styles/tokens';
import { Frame, NavBar, Pill, Lbl, BtnPink, InputField } from '../components/ui';
import { LOCS } from '../constants';
import type { ChecklistConfig } from '../types';
interface P { name:string; location:string; section:string; shift:string; config:ChecklistConfig; onNameChange:(v:string)=>void; onLocationChange:(v:string)=>void; onSectionChange:(v:string)=>void; onShiftChange:(v:string)=>void; onStart:()=>void; onBack:()=>void; getSections:(l:string)=>string[]; getEnabledShifts:(l:string,s:string)=>string[]; }
export function HomePage({ name,location,section,shift,onNameChange,onLocationChange,onSectionChange,onShiftChange,onStart,onBack,getSections,getEnabledShifts }: P) {
  const canStart = name.trim().length>0&&location!==''&&section!==''&&shift!=='';
  return <Frame><NavBar onBack={onBack}/>
    <div style={{marginBottom:'1.75rem'}}><div style={{fontSize:'1.15rem',fontWeight:600,color:C.t1,marginBottom:'0.2rem'}}>Section Checklists</div><div style={{fontSize:'0.72rem',color:C.t4}}>Fill in your details to begin</div></div>
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
      <div><Lbl>Your name</Lbl><InputField value={name} onChange={e=>onNameChange(e.target.value)} placeholder="Enter your name" autoCapitalize="words" maxLength={80}/></div>
      <div><Lbl>Location</Lbl><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>{LOCS.map(l=><Pill key={l} label={l} active={location===l} onClick={()=>{onLocationChange(l);onSectionChange('');onShiftChange('');}}/>)}</div></div>
      {location&&<div><Lbl>Section</Lbl><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>{getSections(location).map(s=><Pill key={s} label={s} active={section===s} onClick={()=>{onSectionChange(s);onShiftChange('');}}/>)}</div></div>}
      {section&&<div><Lbl>Shift</Lbl><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>{getEnabledShifts(location,section).map(sh=><Pill key={sh} label={sh} active={shift===sh} onClick={()=>onShiftChange(sh)}/>)}</div></div>}
      <BtnPink onClick={onStart} disabled={!canStart}>{canStart?<>Start Checklist <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>:'Fill in all fields to continue'}</BtnPink>
    </div>
  </Frame>;
}
