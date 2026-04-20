/**
 * ManageAccessTab — admin account management including location access control.
 *
 * Owners can:
 *   - View all admin accounts and their assigned locations
 *   - Add a new admin (name + PIN + role + locations)
 *   - Edit an existing admin's location access
 *   - Reset an existing admin's PIN
 *   - Remove an admin account
 *
 * Location access:
 *   - Empty selection = all locations (shown as "All locations")
 *   - Owners always see all regardless of their own location setting
 *   - Admins only see data for their assigned locations
 *
 * @author Joshua Bosen
 */
import { useState } from 'react';
import { C, SH } from '../styles/tokens';
import { SecLbl, BtnPink, InputField, Lbl } from './ui';
import {
  createAdminAccount,
  resetAdminPin,
  deleteAdminAccount,
  updateAdminLocations,
} from '../lib/auth';
import type { AdminAccount } from '../lib/auth';
import { LOCS } from '../constants';

interface ManageAccessTabProps {
  accounts: AdminAccount[];
  currentAdminName: string;
  onRefresh: () => void;
}

type ActiveForm =
  | { type: 'add' }
  | { type: 'resetPin'; account: AdminAccount }
  | { type: 'editLocations'; account: AdminAccount }
  | null;

/** Renders a checkbox-style location selector. */
function LocationSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (locs: string[]) => void;
}) {
  function toggle(loc: string) {
    onChange(
      selected.includes(loc)
        ? selected.filter((l) => l !== loc)
        : [...selected, loc],
    );
  }

  return (
    <div>
      {/* "All locations" toggle */}
      <button
        type="button"
        onClick={() => onChange([])}
        style={{
          width: '100%',
          background: selected.length === 0 ? 'rgba(13,216,196,0.12)' : C.well,
          boxShadow: selected.length === 0 ? SH.teal : SH.downSm,
          border: `1px solid ${selected.length === 0 ? 'rgba(13,216,196,0.3)' : 'transparent'}`,
          borderRadius: '10px',
          padding: '0.625rem 0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: '0.5rem',
          transition: 'all 0.18s',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: selected.length === 0 ? 600 : 400, color: selected.length === 0 ? C.teal : C.t3 }}>
          All locations
        </span>
        {selected.length === 0 && (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Individual location toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {LOCS.map((loc) => {
          const on = selected.includes(loc);
          return (
            <button
              key={loc}
              type="button"
              onClick={() => toggle(loc)}
              style={{
                background: on ? C.teal : C.surface,
                boxShadow: on ? SH.teal : SH.upSm,
                border: 'none',
                borderRadius: '10px',
                padding: '0.45rem 0.875rem',
                fontSize: '0.72rem',
                fontWeight: on ? 600 : 500,
                color: on ? '#0C0A22' : C.t3,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.18s',
              }}
            >
              {loc}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: '0.62rem', color: C.t4, marginTop: '0.625rem' }}>
        {selected.length === 0
          ? 'This admin will see all locations.'
          : `This admin will only see: ${selected.join(', ')}.`}
      </p>
    </div>
  );
}

/** Compact location badge shown on the account card. */
function LocationBadge({ locations }: { locations: string[] }) {
  if (!locations || locations.length === 0) {
    return (
      <span style={{ fontSize: '0.62rem', color: C.teal, background: 'rgba(13,216,196,0.1)', border: '1px solid rgba(13,216,196,0.2)', borderRadius: '6px', padding: '0.15rem 0.5rem' }}>
        All locations
      </span>
    );
  }
  return (
    <span style={{ fontSize: '0.62rem', color: C.t3, background: C.well, borderRadius: '6px', padding: '0.15rem 0.5rem' }}>
      {locations.join(', ')}
    </span>
  );
}

export function ManageAccessTab({ accounts, currentAdminName, onRefresh }: ManageAccessTabProps) {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'owner'>('admin');
  const [newLocations, setNewLocations] = useState<string[]>([]);
  const [editLocations, setEditLocations] = useState<string[]>([]);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setActiveForm(null);
    setNewName(''); setNewRole('admin'); setNewLocations([]);
    setPin(''); setPinConfirm(''); setError('');
  }

  async function handleAddAdmin() {
    setError('');
    if (!newName.trim()) { setError('Name is required.'); return; }
    if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }
    if (pin !== pinConfirm) { setError('PINs do not match.'); return; }
    setSaving(true);
    try {
      await createAdminAccount(newName.trim(), pin, newRole, newLocations);
      resetForm(); onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create account.');
    } finally { setSaving(false); }
  }

  async function handleResetPin() {
    if (activeForm?.type !== 'resetPin') return;
    setError('');
    if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }
    if (pin !== pinConfirm) { setError('PINs do not match.'); return; }
    setSaving(true);
    try {
      await resetAdminPin(activeForm.account.id, pin);
      resetForm(); onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset PIN.');
    } finally { setSaving(false); }
  }

  async function handleSaveLocations() {
    if (activeForm?.type !== 'editLocations') return;
    setSaving(true);
    try {
      await updateAdminLocations(activeForm.account.id, editLocations);
      resetForm(); onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update locations.');
    } finally { setSaving(false); }
  }

  async function handleDelete(account: AdminAccount) {
    if (account.name === currentAdminName) return;
    if (!window.confirm(`Remove "${account.name}"? They will lose admin access immediately.`)) return;
    try {
      await deleteAdminAccount(account.id);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove account.');
    }
  }

  function PinInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
        placeholder={placeholder}
        style={{
          width: '100%', background: C.well, boxShadow: SH.downSm, border: 'none',
          borderRadius: '10px', padding: '0.75rem', color: C.t1,
          fontSize: '1.2rem', fontFamily: 'inherit', outline: 'none',
          letterSpacing: '0.3em', textAlign: 'center', boxSizing: 'border-box' as const,
        }}
      />
    );
  }

  return (
    <div>
      <SecLbl>Admin accounts</SecLbl>

      {/* Account list */}
      <div style={{ marginBottom: '1.25rem' }}>
        {accounts.length === 0 ? (
          <p style={{ color: C.t4, fontSize: '0.8rem', padding: '1rem 0' }}>No admin accounts yet.</p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              style={{ background: C.surface, boxShadow: SH.upSm, borderRadius: '14px', padding: '0.875rem 1rem', marginBottom: '0.5rem' }}
            >
              {/* Top row: avatar + name/role + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: account.role === 'owner' ? 'rgba(232,41,122,0.15)' : 'rgba(13,216,196,0.1)',
                  border: `1px solid ${account.role === 'owner' ? 'rgba(232,41,122,0.3)' : 'rgba(13,216,196,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 600,
                  color: account.role === 'owner' ? C.pink : C.teal,
                }}>
                  {account.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: C.t1 }}>
                    {account.name}
                    {account.name === currentAdminName && (
                      <span style={{ fontSize: '0.63rem', color: C.t4, marginLeft: '0.4rem' }}>(you)</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: account.role === 'owner' ? C.pink : C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.1rem' }}>
                    {account.role}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      resetForm();
                      setEditLocations(account.locations ?? []);
                      setActiveForm({ type: 'editLocations', account });
                    }}
                    type="button"
                    style={{ background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '8px', padding: '0.35rem 0.625rem', fontSize: '0.65rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    Locations
                  </button>
                  <button
                    onClick={() => { resetForm(); setActiveForm({ type: 'resetPin', account }); }}
                    type="button"
                    style={{ background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '8px', padding: '0.35rem 0.625rem', fontSize: '0.65rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    Reset PIN
                  </button>
                  {account.name !== currentAdminName && (
                    <button
                      onClick={() => void handleDelete(account)}
                      type="button"
                      style={{ background: 'rgba(232,41,122,0.08)', boxShadow: SH.downSm, border: '1px solid rgba(232,41,122,0.2)', borderRadius: '8px', padding: '0.35rem 0.625rem', fontSize: '0.65rem', color: C.pink, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Location badge row */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6rem', color: C.t4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Access:</span>
                {account.role === 'owner'
                  ? <span style={{ fontSize: '0.62rem', color: C.pink, background: 'rgba(232,41,122,0.08)', border: '1px solid rgba(232,41,122,0.2)', borderRadius: '6px', padding: '0.15rem 0.5rem' }}>All (owner)</span>
                  : <LocationBadge locations={account.locations} />
                }
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add admin button */}
      {!activeForm && (
        <button
          onClick={() => { resetForm(); setActiveForm({ type: 'add' }); }}
          type="button"
          style={{ width: '100%', background: 'transparent', border: '1px dashed #2A2648', borderRadius: '14px', padding: '0.875rem', fontSize: '0.8rem', color: C.t4, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem' }}
        >
          + Add admin
        </button>
      )}

      {/* ── Add admin form ─────────────────────────────────────────────── */}
      {activeForm?.type === 'add' && (
        <div style={{ background: C.surface, boxShadow: SH.upMd, borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
          <SecLbl>New admin account</SecLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <Lbl>Name</Lbl>
              <InputField value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Sarah" maxLength={40} autoCapitalize="words" />
            </div>

            <div>
              <Lbl>Role</Lbl>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['admin', 'owner'] as const).map((r) => (
                  <button key={r} onClick={() => setNewRole(r)} type="button" style={{ flex: 1, background: newRole === r ? (r === 'owner' ? C.pink : C.teal) : C.well, boxShadow: newRole === r ? (r === 'owner' ? SH.pink : SH.teal) : SH.downSm, border: 'none', borderRadius: '10px', padding: '0.6rem', fontSize: '0.72rem', fontWeight: newRole === r ? 600 : 500, color: newRole === r ? '#0C0A22' : C.t3, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.18s' }}>
                    {r}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.62rem', color: C.t4, marginTop: '0.4rem' }}>Owner can manage other admins and always sees all locations.</p>
            </div>

            {/* Location assignment — only relevant for non-owner */}
            {newRole === 'admin' && (
              <div>
                <Lbl>Location access</Lbl>
                <LocationSelector selected={newLocations} onChange={setNewLocations} />
              </div>
            )}

            <div>
              <Lbl>PIN (4–8 digits)</Lbl>
              <PinInput value={pin} onChange={setPin} placeholder="••••" />
            </div>

            <div>
              <Lbl>Confirm PIN</Lbl>
              <PinInput value={pinConfirm} onChange={setPinConfirm} placeholder="••••" />
            </div>

            {error && <p style={{ fontSize: '0.72rem', color: C.pink }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={resetForm} type="button" style={{ flex: 1, background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '12px', padding: '0.75rem', fontSize: '0.8rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <div style={{ flex: 2 }}><BtnPink onClick={handleAddAdmin} disabled={saving}>{saving ? 'Creating…' : 'Create Account'}</BtnPink></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit locations form ────────────────────────────────────────── */}
      {activeForm?.type === 'editLocations' && (
        <div style={{ background: C.surface, boxShadow: SH.upMd, borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
          <SecLbl>Location access — {activeForm.account.name}</SecLbl>

          {activeForm.account.role === 'owner' ? (
            <p style={{ fontSize: '0.8rem', color: C.t3, padding: '0.5rem 0' }}>
              Owners always have access to all locations. This cannot be changed.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <LocationSelector selected={editLocations} onChange={setEditLocations} />
              {error && <p style={{ fontSize: '0.72rem', color: C.pink }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={resetForm} type="button" style={{ flex: 1, background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '12px', padding: '0.75rem', fontSize: '0.8rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <div style={{ flex: 2 }}><BtnPink onClick={handleSaveLocations} disabled={saving}>{saving ? 'Saving…' : 'Save Access'}</BtnPink></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reset PIN form ─────────────────────────────────────────────── */}
      {activeForm?.type === 'resetPin' && (
        <div style={{ background: C.surface, boxShadow: SH.upMd, borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
          <SecLbl>Reset PIN — {activeForm.account.name}</SecLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Lbl>New PIN (4–8 digits)</Lbl>
              <PinInput value={pin} onChange={setPin} placeholder="••••" />
            </div>
            <div>
              <Lbl>Confirm new PIN</Lbl>
              <PinInput value={pinConfirm} onChange={setPinConfirm} placeholder="••••" />
            </div>
            {error && <p style={{ fontSize: '0.72rem', color: C.pink }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={resetForm} type="button" style={{ flex: 1, background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '12px', padding: '0.75rem', fontSize: '0.8rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <div style={{ flex: 2 }}><BtnPink onClick={handleResetPin} disabled={saving}>{saving ? 'Saving…' : 'Set New PIN'}</BtnPink></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
