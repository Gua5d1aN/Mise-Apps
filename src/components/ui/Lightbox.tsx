/**
 * Lightbox — fullscreen overlay for viewing task example photos.
 *
 * Tapping anywhere on the overlay closes it.
 * Displayed when a staff member taps "See example →" on a task that has
 * an example photo uploaded by an admin.
 *
 * @author Joshua Bosen
 */
import { C } from '../../styles/tokens';

interface LightboxProps {
  url: string;
  onClose: (e: React.MouseEvent) => void;
}

export function Lightbox({ url, onClose }: LightboxProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.94)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <p style={{
        fontSize: '0.62rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: C.teal,
        marginBottom: '1rem',
        opacity: 0.7,
      }}>
        Example standard — tap to close
      </p>
      <img
        src={url}
        alt="Example standard"
        style={{
          maxWidth: '100%',
          maxHeight: '80vh',
          borderRadius: '1rem',
          objectFit: 'contain',
          border: '1px solid #2A2648',
        }}
      />
    </div>
  );
}
