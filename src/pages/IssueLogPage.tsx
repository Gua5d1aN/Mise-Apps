/**
 * IssueLogPage — maintenance issue submission screen.
 *
 * Staff fill in their name, the item/equipment with the problem, and attach
 * a photo. All three fields are required before submission is allowed.
 *
 * Photo upload uses the same Supabase Storage pattern as task photos but
 * writes to the issues/ prefix to keep them separated in the bucket.
 *
 * @author Joshua Bosen
 */
import { C } from '../styles/tokens';
import { Frame, NavBar, Lbl, InputField, BtnPink } from '../components/ui';

interface IssueLogPageProps {
  name: string;
  item: string;
  photoUrl: string | null;
  uploading: boolean;
  submitting: boolean;
  error: string;
  onNameChange: (v: string) => void;
  onItemChange: (v: string) => void;
  onPhotoSelect: (file: File) => void;
  onRemovePhoto: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function IssueLogPage({
  name, item, photoUrl, uploading, submitting, error,
  onNameChange, onItemChange, onPhotoSelect, onRemovePhoto, onSubmit, onBack,
}: IssueLogPageProps) {
  const canSubmit = name.trim().length > 0 && item.trim().length > 0 && photoUrl !== null && !submitting;

  return (
    <Frame>
      <NavBar onBack={onBack} />

      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 600, color: C.t1, marginBottom: '0.2rem' }}>Log an Issue</div>
        <div style={{ fontSize: '0.72rem', color: C.t4 }}>Photo, item name and submit</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name */}
        <div>
          <Lbl>Your name</Lbl>
          <InputField value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" autoCapitalize="words" maxLength={80} />
        </div>

        {/* Item / Equipment */}
        <div>
          <Lbl>Item / Equipment</Lbl>
          <InputField value={item} onChange={(e) => onItemChange(e.target.value)} placeholder="e.g. Fryer 2, Combi oven" maxLength={120} />
        </div>

        {/* Photo */}
        <div>
          <Lbl>Photo</Lbl>
          {photoUrl ? (
            /* Photo attached confirmation */
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1rem', background: C.surface,
              boxShadow: '4px 4px 9px rgba(0,0,0,0.55), -2px -2px 6px rgba(85,65,185,0.18)',
              borderRadius: '14px',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={C.teal} strokeWidth="1.25" />
                <circle cx="8" cy="9" r="2" stroke={C.teal} strokeWidth="1.25" />
                <path d="M6 5l1-2h2l1 2" stroke={C.teal} strokeWidth="1.25" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: '0.8rem', color: C.teal, flex: 1 }}>Photo attached</span>
              <button
                onClick={onRemovePhoto}
                type="button"
                style={{ background: 'none', border: 'none', color: C.t4, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Remove
              </button>
            </div>
          ) : (
            /* Photo upload label */
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              width: '100%',
              padding: '0.875rem 1rem',
              background: C.well,
              boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.55), inset -2px -2px 7px rgba(85,65,185,0.18)',
              borderRadius: '14px',
              textAlign: 'center' as const,
              cursor: uploading ? 'not-allowed' : 'pointer',
              color: uploading ? C.t4 : C.amber,
              fontSize: '0.875rem',
              boxSizing: 'border-box' as const,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={C.amber} strokeWidth="1.25" />
                <circle cx="8" cy="9" r="2" stroke={C.amber} strokeWidth="1.25" />
                <path d="M6 5l1-2h2l1 2" stroke={C.amber} strokeWidth="1.25" strokeLinejoin="round" />
              </svg>
              {uploading ? 'Uploading…' : 'Take or upload photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                disabled={uploading}
                onChange={(e) => { if (e.target.files?.[0]) onPhotoSelect(e.target.files[0]); }}
              />
            </label>
          )}
        </div>

        {/* Inline error */}
        {error && <p style={{ fontSize: '0.75rem', color: C.pink, textAlign: 'center' }}>{error}</p>}

        <BtnPink onClick={onSubmit} disabled={!canSubmit}>
          {submitting ? 'Submitting…' : 'Submit Issue'}
          {!submitting && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8M9 5l3 3-3 3" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </BtnPink>
      </div>
    </Frame>
  );
}
