/**
 * TabBtn — admin panel tab navigation button.
 * Active: solid teal. Inactive: surface with muted text.
 * @author Joshua Bosen
 */
import { C, SH } from '../../styles/tokens';

interface TabBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function TabBtn({ label, active, onClick }: TabBtnProps) {
  return (
    <button
      className="nm-pill"
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={active}
      style={{
        background: active ? C.teal : C.surface,
        boxShadow: active ? SH.teal : SH.upSm,
        border: 'none',
        borderRadius: '10px',
        padding: '0.55rem 0.875rem',
        fontSize: '0.72rem',
        fontWeight: active ? 600 : 500,
        color: active ? '#0C0A22' : C.t3,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.18s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}
