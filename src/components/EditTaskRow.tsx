/**
 * EditTaskRow — editable task row in the admin Edit Checklists panel.
 *
 * Allows admins to:
 *   - Edit the task text
 *   - Toggle photo requirement (camera SVG icon button)
 *   - Upload / remove an example photo for staff reference
 *   - Remove the task entirely
 *
 * Changes propagate immediately to the parent which persists to Supabase.
 *
 * @author Joshua Bosen
 */
import { useRef, useState } from 'react';
import { C, SH } from '../styles/tokens';
import type { Task } from '../types';
import { uploadPhoto } from '../lib/storage';

interface EditTaskRowProps {
  task: Task;
  index: number;
  onUpdateText: (index: number, text: string) => void;
  onTogglePhoto: (index: number) => void;
  onSetExample: (index: number, url: string | null) => void;
  onRemove: (index: number) => void;
}

export function EditTaskRow({ task, index, onUpdateText, onTogglePhoto, onSetExample, onRemove }: EditTaskRowProps) {
  const exFileRef = useRef<HTMLInputElement>(null);
  const [exUploading, setExUploading] = useState(false);
  const hasExample = !!task.examplePhotoUrl;

  async function handleExampleUpload(file: File) {
    setExUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `examples/${Date.now()}_${index}.${ext}`;
      const url = await uploadPhoto(file, 'examples', String(index), 'example', index);
      void path; // path used inside uploadPhoto
      onSetExample(index, url);
    } catch {
      alert('Upload failed. Try again.');
    } finally {
      setExUploading(false);
    }
  }

  return (
    <div style={{
      background: C.surface,
      boxShadow: SH.upMd,
      borderRadius: '14px',
      padding: '0.75rem',
      marginBottom: '0.625rem',
    }}>
      {/* Text + photo toggle + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          value={task.text}
          onChange={(e) => onUpdateText(index, e.target.value)}
          maxLength={200}
          style={{
            flex: 1,
            background: C.well,
            boxShadow: SH.downSm,
            border: 'none',
            borderRadius: '10px',
            padding: '0.6rem 0.75rem',
            color: C.t1,
            fontSize: '0.8rem',
            fontFamily: 'inherit',
            outline: 'none',
            minWidth: 0,
          }}
        />

        {/* Camera icon — toggles requiresPhoto */}
        <button
          onClick={() => onTogglePhoto(index)}
          type="button"
          aria-pressed={task.requiresPhoto}
          title={task.requiresPhoto ? 'Remove photo requirement' : 'Require a photo for this task'}
          style={{
            background: task.requiresPhoto ? 'rgba(196,128,58,0.15)' : C.surface,
            boxShadow: task.requiresPhoto
              ? 'inset 2px 2px 5px rgba(0,0,0,0.45), inset -1px -1px 4px rgba(85,65,185,0.12)'
              : SH.upSm,
            border: task.requiresPhoto ? '1px solid rgba(196,128,58,0.3)' : 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.18s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={task.requiresPhoto ? C.amber : '#4A4468'} strokeWidth="1.25" />
            <circle cx="8" cy="9" r="2" stroke={task.requiresPhoto ? C.amber : '#4A4468'} strokeWidth="1.25" />
            <path d="M6 5l1-2h2l1 2" stroke={task.requiresPhoto ? C.amber : '#4A4468'} strokeWidth="1.25" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Remove task */}
        <button
          onClick={() => onRemove(index)}
          type="button"
          aria-label={`Remove task: ${task.text}`}
          style={{
            background: 'none',
            border: 'none',
            color: C.t4,
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            flexShrink: 0,
            lineHeight: 1,
            transition: 'color 0.15s',
            fontFamily: 'inherit',
          }}
        >
          ×
        </button>
      </div>

      {/* Example photo section — only shown when requiresPhoto is on */}
      {task.requiresPhoto && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          {hasExample ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', color: C.teal, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Example set
              </span>
              <button
                onClick={() => onSetExample(index, null)}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '0.63rem', color: C.t4, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label style={{
              fontSize: '0.65rem',
              color: exUploading ? C.t4 : C.amber,
              cursor: 'pointer',
              border: '1px dashed rgba(196,128,58,0.3)',
              borderRadius: '8px',
              padding: '0.3rem 0.625rem',
              transition: 'all 0.15s',
            }}>
              {exUploading ? 'Uploading…' : '+ Add example photo'}
              <input
                ref={exFileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={exUploading}
                onChange={(e) => { if (e.target.files?.[0]) void handleExampleUpload(e.target.files[0]); }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
