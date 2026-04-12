/**
 * InputField — recessed text or password input with inset neumorphic shadow.
 *
 * The inset shadow gives it a "carved into the surface" look, distinguishing
 * inputs visually from raised card elements.
 *
 * @author Joshua Bosen
 */
import { C, SH } from '../../styles/tokens';

interface InputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  maxLength?: number;
  autoComplete?: string;
  autoCapitalize?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  autoComplete,
  autoCapitalize,
  onKeyDown,
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      onKeyDown={onKeyDown}
      style={{
        width: '100%',
        background: C.well,
        boxShadow: SH.down,
        border: 'none',
        borderRadius: '14px',
        padding: '0.875rem 1rem',
        color: C.t1,
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
