/**
 * AdminLoginPage — password gate for the admin panel.
 *
 * ⚠️  PHASE 1 ONLY: Client-side password comparison against a value embedded
 * in the JS bundle. Not truly secret. Phase 3 replaces this with Supabase
 * Auth (magic link + org_members role table).
 *
 * @author Joshua Bosen
 */
import { C, SH } from '../styles/tokens';
import { Frame, NavBar, Lbl, InputField, BtnPink } from '../components/ui';

interface AdminLoginPageProps {
  password: string;
  hasError: boolean;
  onPasswordChange: (pw: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function AdminLoginPage({ password, hasError, onPasswordChange, onSubmit, onBack }: AdminLoginPageProps) {
  return (
    <Frame>
      <NavBar onBack={onBack} />

      {/* Lock icon */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: C.surface, boxShadow: SH.up,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.75rem',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke={C.t3} strokeWidth="1.75" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={C.t3} strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.5" fill={C.t3} />
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 600, color: C.t1, marginBottom: '0.35rem' }}>Admin Access</div>
        <div style={{ fontSize: '0.75rem', color: C.t4 }}>Enter your password to continue</div>
      </div>

      <div>
        <Lbl>Password</Lbl>
        <InputField
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
        />
        {hasError && (
          <p style={{ fontSize: '0.7rem', color: C.pink, marginTop: '0.5rem' }}>Incorrect password.</p>
        )}
        <div style={{ marginTop: '1rem' }}>
          <BtnPink onClick={onSubmit}>Enter Admin →</BtnPink>
        </div>
      </div>
    </Frame>
  );
}
