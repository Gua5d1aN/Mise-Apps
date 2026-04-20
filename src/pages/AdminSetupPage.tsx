/**
 * AdminSetupPage — first-run bootstrap to create the initial owner account.
 * Shown only when no admin accounts exist for the venue.
 * @author Joshua Bosen
 */
import { useState } from 'react';
import { C, SH } from '../styles/tokens';
import { Frame, NavBar, Lbl, BtnPink, InputField } from '../components/ui';
import { createAdminAccount, saveSession } from '../lib/auth';
import type { AdminSession } from '../lib/auth';

interface AdminSetupPageProps {
  onComplete: (session: AdminSession) => void;
  onBack: () => void;
}

/**
 * PIN input — at module level to prevent focus loss on parent re-renders.
 * Defining this inside a component causes React to remount it on every
 * state change, losing the input's focus after each keystroke.
 */
function PinInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: C.well,
        boxShadow: SH.downSm,
        border: 'none',
        borderRadius: '10px',
        padding: '0.75rem',
        color: C.t1,
        fontSize: '1.2rem',
        fontFamily: 'inherit',
        outline: 'none',
        letterSpacing: '0.3em',
        textAlign: 'center',
        boxSizing: 'border-box' as const,
      }}
    />
  );
}

export function AdminSetupPage({ onComplete, onBack }: AdminSetupPageProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }
    if (pin !== pinConfirm) { setError('PINs do not match.'); return; }
    if (!/^\d+$/.test(pin)) { setError('PIN must contain digits only.'); return; }
    setSaving(true);
    try {
      await createAdminAccount(name.trim(), pin, 'owner', []);
      onComplete(saveSession(name.trim(), 'owner', []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Frame>
      <NavBar onBack={onBack} />

      {/* Key icon */}
      <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(232,41,122,0.12)', border:'1px solid rgba(232,41,122,0.25)', boxShadow:SH.up, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={C.pink} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
        <div style={{ fontSize:'1.2rem', fontWeight:600, color:C.t1, marginBottom:'0.35rem' }}>Create your admin account</div>
        <div style={{ fontSize:'0.75rem', color:C.t4, lineHeight:1.6 }}>No admin accounts exist yet. Set up your owner account to get started.</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        <div><Lbl>Your name</Lbl><InputField value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Josh" autoCapitalize="words" maxLength={40}/></div>
        <div><Lbl>Choose a PIN (4–8 digits)</Lbl><PinInput value={pin} onChange={setPin} placeholder="••••"/></div>
        <div><Lbl>Confirm PIN</Lbl><PinInput value={pinConfirm} onChange={setPinConfirm} placeholder="••••"/></div>
        {error && <p style={{ fontSize:'0.75rem', color:C.pink, textAlign:'center' }}>{error}</p>}
        <div style={{ background:'rgba(232,41,122,0.06)', border:'1px solid rgba(232,41,122,0.15)', borderRadius:'10px', padding:'0.75rem 1rem' }}>
          <p style={{ fontSize:'0.72rem', color:C.t3, lineHeight:1.6 }}>
            This account will be created as <span style={{ color:C.pink, fontWeight:600 }}>Owner</span> — you can add other admins from the Manage Access tab after setup.
          </p>
        </div>
        <BtnPink onClick={handleCreate} disabled={saving}>{saving ? 'Creating account…' : 'Create Account →'}</BtnPink>
      </div>
    </Frame>
  );
}
