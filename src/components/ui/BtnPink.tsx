import type { ReactNode } from 'react';
import { C, SH } from '../../styles/tokens';
interface BtnPinkProps { children: ReactNode; onClick: () => void; disabled?: boolean; fullWidth?: boolean; }
export function BtnPink({ children, onClick, disabled = false, fullWidth = true }: BtnPinkProps) {
  return <button className="nm-btn-pink" onClick={onClick} disabled={disabled} type="button" style={{ width: fullWidth ? '100%' : 'auto', background: disabled ? C.surface : C.pink, boxShadow: disabled ? SH.upSm : SH.pink, border: 'none', borderRadius: '16px', padding: '1rem', fontSize: '0.875rem', fontWeight: 500, color: disabled ? C.t4 : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.18s' }}>{children}</button>;
}
