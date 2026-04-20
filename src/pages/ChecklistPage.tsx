/** @author Joshua Bosen */
import { C, SH } from '../styles/tokens';
import { NavBar, BtnPink, BtnAmber } from '../components/ui';
import { TaskRow } from '../components/TaskRow';
import type { Task } from '../types';
interface P { staffName:string; location:string; section:string; shift:string; tasks:Task[]; checked:boolean[]; photos:(string|null)[]; uploadingIndex:number; submitting:boolean; photoUploadError:boolean; submitError:boolean; onBack:()=>void; onToggleTask:(i:number)=>void; onUploadPhoto:(f:File,i:number)=>void; onSubmit:()=>void; }
export function ChecklistPage({ staffName,location,section,shift,tasks,checked,photos,uploadingIndex,submitting,photoUploadError,submitError,onBack,onToggleTask,onUploadPhoto,onSubmit }: P) {
  const isDone=(i:number)=>checked[i]&&(!tasks[i]?.requiresPhoto||photos[i]!==null);
  const completed=tasks.filter((_,i)=>isDone(i)).length, pct=tasks.length>0?Math.round(completed/tasks.length*100):0;
  const allDone=tasks.length>0&&completed===tasks.length, incomplete=tasks.length-completed;
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',padding:'2rem 1.5rem'}}>
    <div style={{maxWidth:'360px',width:'100%',margin:'0 auto',flex:1,display:'flex',flexDirection:'column'}}>
      <NavBar onBack={onBack}/>
      <div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:C.t4,marginBottom:'0.3rem'}}>{staffName} · {location} · {section}</div><div style={{fontSize:'1.2rem',fontWeight:600,color:C.t1}}>{shift} Checklist</div></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'0.5rem'}}><span style={{fontSize:'0.68rem',color:C.t3}}>{completed} of {tasks.length} complete</span><span style={{fontSize:'0.68rem',fontWeight:600,color:C.teal}}>{pct}%</span></div>
      <div style={{background:C.well,boxShadow:SH.downSm,borderRadius:'100px',height:'7px',overflow:'hidden',marginBottom:'1.5rem'}}><div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:C.teal,transition:'width 0.4s ease'}}/></div>
      <div style={{flex:1,marginBottom:'1.25rem'}}>
        {tasks.map((task,i)=><TaskRow key={i} task={task} index={i} isChecked={checked[i]??false} photoUrl={photos[i]??null} uploadingIndex={uploadingIndex} onToggle={()=>onToggleTask(i)} onUpload={onUploadPhoto}/>)}
        {tasks.length===0&&<p style={{textAlign:'center',color:C.t4,fontSize:'0.875rem',padding:'2rem 0'}}>No tasks for this shift yet.</p>}
      </div>
      {photoUploadError&&<p style={{fontSize:'0.75rem',color:C.pink,marginBottom:'0.5rem',textAlign:'center'}}>Photo upload failed — check connection and try again.</p>}
      {submitError&&<p style={{fontSize:'0.75rem',color:C.pink,marginBottom:'0.5rem',textAlign:'center'}}>Submission failed — check connection and try again.</p>}
      {!allDone&&tasks.length>0&&<div style={{background:C.well,boxShadow:SH.downSm,borderRadius:'12px',padding:'0.65rem 1rem',display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'0.625rem'}}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M8 3L14 13H2L8 3Z" stroke={C.amber} strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke={C.amber} strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span style={{fontSize:'0.7rem',color:C.amber,lineHeight:1.35}}>{incomplete} task{incomplete!==1?'s':''} not completed</span>
      </div>}
      {allDone?<BtnPink onClick={onSubmit} disabled={submitting}>{submitting?'Submitting…':'Submit Checklist'}{!submitting&&<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</BtnPink>
      :<BtnAmber onClick={onSubmit} disabled={submitting||tasks.length===0}>{submitting?'Submitting…':'Submit anyway'}{!submitting&&<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke={C.amber} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}</BtnAmber>}
    </div>
  </div>;
}
