/**
 * TaskRow — renders a single task within the active checklist.
 *
 * Three completion states:
 *   1. Unchecked — white task text, raised card shadow.
 *   2. Checked, no photo required — fully done, text struck through, card recessed.
 *   3. Checked, photo required — partially done until photo uploaded.
 *
 * When a task has an examplePhotoUrl set by an admin, a "See example →" button
 * appears after the task is checked, opening a Lightbox with the reference image.
 *
 * @author Joshua Bosen
 */
import { useRef, useState } from 'react';
import { C, SH } from '../styles/tokens';
import { CheckTick, Lightbox } from './ui';
import type { Task } from '../types';

interface TaskRowProps {
  task: Task;
  index: number;
  isChecked: boolean;
  photoUrl: string | null;
  uploadingIndex: number;
  onToggle: () => void;
  onUpload: (file: File, index: number) => void;
}

export function TaskRow({ task, index, isChecked, photoUrl, uploadingIndex, onToggle, onUpload }: TaskRowProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showExample, setShowExample] = useState(false);

  const isUploading = uploadingIndex === index;
  const needsPhoto = task.requiresPhoto;
  const hasPhoto = photoUrl !== null;
  const hasExample = needsPhoto && !!task.examplePhotoUrl;
  const isDone = isChecked && (!needsPhoto || hasPhoto);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file, index);
    e.target.value = '';
  }

  return (
    <div style={{ marginBottom: '0.65rem' }}>
      {/* Lightbox for example photo */}
      {showExample && task.examplePhotoUrl && (
        <Lightbox
          url={task.examplePhotoUrl}
          onClose={(e) => { e.stopPropagation(); setShowExample(false); }}
        />
      )}

      {/* Task toggle card */}
      <div
        className="nm-card"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-pressed={isChecked}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        style={{
          background: isDone ? C.bg : C.surface,
          boxShadow: isDone
            ? 'inset 4px 4px 10px rgba(0,0,0,0.52), inset -2px -2px 7px rgba(85,65,185,0.14)'
            : SH.upMd,
          borderRadius: '16px',
          padding: '1rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.22s',
        }}
      >
        {/* Completion circle */}
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          flexShrink: 0,
          background: isChecked ? C.teal : C.well,
          boxShadow: isChecked ? SH.teal : SH.downSm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.22s',
        }}>
          {isChecked && <CheckTick />}
        </div>

        {/* Task text */}
        <span style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          color: isDone ? C.t4 : C.t2,
          flex: 1,
          textAlign: 'left',
          lineHeight: 1.4,
          textDecoration: isDone ? 'line-through' : 'none',
          transition: 'all 0.22s',
        }}>
          {task.text}
        </span>

        {/* Photo required badge */}
        {needsPhoto && (
          <span style={{
            fontSize: '0.62rem',
            color: hasPhoto ? C.teal : C.amber,
            flexShrink: 0,
            background: hasPhoto ? 'rgba(13,216,196,0.1)' : 'rgba(196,128,58,0.1)',
            borderRadius: '6px',
            padding: '0.2rem 0.45rem',
            border: `1px solid ${hasPhoto ? 'rgba(13,216,196,0.25)' : 'rgba(196,128,58,0.25)'}`,
          }}>
            📷
          </span>
        )}
      </div>

      {/* Photo upload area — shown when checked and photo is required */}
      {isChecked && needsPhoto && (
        <div style={{
          paddingLeft: '3.75rem',
          marginTop: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          {hasPhoto ? (
            <span style={{ fontSize: '0.72rem', color: C.teal, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Photo uploaded
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                style={{
                  background: C.surface,
                  boxShadow: SH.upSm,
                  border: '1px solid rgba(196,128,58,0.3)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: C.amber,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={C.amber} strokeWidth="1.25" />
                  <circle cx="8" cy="9" r="2" stroke={C.amber} strokeWidth="1.25" />
                  <path d="M6 5l1-2h2l1 2" stroke={C.amber} strokeWidth="1.25" strokeLinejoin="round" />
                </svg>
                {isUploading ? 'Uploading…' : 'Add required photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          )}

          {/* "See example →" button — visible when an example photo is set */}
          {hasExample && (
            <button
              style={{
                background: 'none',
                border: '1px solid rgba(13,216,196,0.2)',
                borderRadius: '8px',
                padding: '0.25rem 0.625rem',
                fontSize: '0.7rem',
                color: C.teal,
                cursor: 'pointer',
                flexShrink: 0,
                fontFamily: 'inherit',
              }}
              onClick={(e) => { e.stopPropagation(); setShowExample(true); }}
              type="button"
            >
              See example →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
