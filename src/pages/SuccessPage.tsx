/**
 * SuccessPage — shown after a checklist is submitted.
 *
 * Shows a teal checkmark, a summary stat bar (completed / shift / photos),
 * and two buttons: New Checklist (starts fresh) and Back to Home (welcome screen).
 *
 * @author Joshua Bosen
 */
import { C, SH } from '../styles/tokens';
import { Frame, Wordmark, BtnPink, CheckBig } from '../components/ui';

interface SuccessPageProps {
  staffName: string;
  location: string;
  section: string;
  shift: string;
  completed: number;
  total: number;
  photosUploaded: number;
  onNewChecklist: () => void;
  onHome: () => void;
}

export function SuccessPage({ staffName, location, section, shift, completed, total, photosUploaded, onNewChecklist, onHome }: SuccessPageProps) {
  return (
    <Frame>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <Wordmark size="1.5rem" />
      </div>

      {/* Teal check circle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: C.teal,
          boxShadow: '8px 8px 20px rgba(10,185,168,0.55), -4px -4px 14px rgba(13,216,196,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckBig />
        </div>
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 600, color: C.t1, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>All done.</div>
        <div style={{ fontSize: '0.8rem', color: C.t3, lineHeight: 1.6 }}>
          {shift} checklist for <span style={{ color: C.t2, fontWeight: 500 }}>{section}</span> submitted.
        </div>
        <div style={{ fontSize: '0.72rem', color: C.t4, marginTop: '0.25rem' }}>{location} · {staffName}</div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: C.well, boxShadow: SH.downSm,
        borderRadius: '14px', padding: '0.875rem 1.25rem', marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {[
          { lbl: 'Completed', val: `${completed} / ${total}`, color: C.teal },
          { lbl: 'Shift', val: shift, color: C.t2 },
          { lbl: 'Photos', val: `${photosUploaded} added`, color: C.t2 },
        ].map((stat, i, arr) => (
          <div key={stat.lbl} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.t4, marginBottom: '0.2rem' }}>{stat.lbl}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: stat.color }}>{stat.val}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: '1px', height: '28px', background: '#2A2648', marginLeft: '1rem' }} />}
          </div>
        ))}
      </div>

      <BtnPink onClick={onNewChecklist}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="rgba(255,255,255,0.8)" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        New Checklist
      </BtnPink>

      <button
        onClick={onHome}
        type="button"
        style={{ width: '100%', marginTop: '0.75rem', background: C.surface, boxShadow: SH.upSm, border: 'none', borderRadius: '16px', padding: '0.875rem', fontSize: '0.8rem', fontWeight: 500, color: C.t3, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
      >
        Back to Home
      </button>
    </Frame>
  );
}
