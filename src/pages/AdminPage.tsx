/**
 * AdminPage — admin panel with four tabs.
 *
 * Tabs:
 *   Submission Log — grouped by date → location, with expand/select/delete
 *   Results        — analytics dashboard (ResultsView component)
 *   Issue Log      — maintenance issues grouped by date, with photo thumbnails
 *   Edit Checklists — dynamic section management, shift enable/disable, task editor
 *
 * @author Joshua Bosen
 */
import { useState } from 'react';
import { C, SH } from '../styles/tokens';
import { TabBtn, ActionBtn, Chip, SecLbl, DateHdr } from '../components/ui';
import { EditTaskRow } from '../components/EditTaskRow';
import { ResultsView } from '../components/ResultsView';
import { downloadCSV } from '../lib/csv';
import { LOCS, SHIFTS, DEFAULT_ENABLED } from '../constants';

import type { AdminTab, ChecklistConfig, ChecklistLog, IssueLog, Task } from '../types';
import { groupLogsByDate, groupIssuesByDate } from '../lib/utils';

interface AdminPageProps {
  config: ChecklistConfig;
  configSaving: boolean;
  logs: ChecklistLog[];
  logsLoading: boolean;
  logsErr: boolean;
  issues: IssueLog[];
  issuesLoading: boolean;
  issuesErr: boolean;
  onExit: () => void;
  onRefreshLogs: () => void;
  onRefreshIssues: () => void;
  onDeleteSelected: (ids: number[]) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onUpdateTaskText: (loc: string, sec: string, sh: string, i: number, text: string) => void;
  onToggleTaskPhoto: (loc: string, sec: string, sh: string, i: number) => void;
  onSetExamplePhoto: (loc: string, sec: string, sh: string, i: number, url: string | null) => void;
  onRemoveTask: (loc: string, sec: string, sh: string, i: number) => void;
  onAddTask: (loc: string, sec: string, sh: string) => void;
  onToggleShiftEnabled: (loc: string, sec: string, sh: string) => void;
  onAddSection: (loc: string, name: string) => void;
  onRemoveSection: (loc: string, sec: string) => void;
  getSections: (loc: string) => string[];
}

export function AdminPage({
  config, configSaving, logs, logsLoading, logsErr,
  issues, issuesLoading, issuesErr,
  onExit, onRefreshLogs, onRefreshIssues,
  onDeleteSelected, onDeleteAll,
  onUpdateTaskText, onToggleTaskPhoto, onSetExamplePhoto,
  onRemoveTask, onAddTask, onToggleShiftEnabled,
  onAddSection, onRemoveSection, getSections,
}: AdminPageProps) {

  // ── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('logs');

  // ── Log selection state ──────────────────────────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Issue state ──────────────────────────────────────────────────────────
  const [issueFilterDate, setIssueFilterDate] = useState('All');
  const [issueFilterName, setIssueFilterName] = useState('');
  const [expandedIssueId, setExpandedIssueId] = useState<number | null>(null);

  // ── Edit state ───────────────────────────────────────────────────────────
  const [editLoc, setEditLoc] = useState(LOCS[0] ?? 'Kitchen');
  const [editSec, setEditSec] = useState(getSections(LOCS[0] ?? 'Kitchen')[0] ?? '');
  const [editShift, setEditShift] = useState('Opening');
  const [newSecName, setNewSecName] = useState('');

  const eSections = getSections(editLoc);
  const _secEntry = config[editLoc]?.[editSec];
  const _secRaw = (_secEntry && !Array.isArray(_secEntry)) ? _secEntry as Record<string, unknown> : {};
  const eTasks = (_secRaw[editShift] as Task[] | undefined) ?? [];
  const eEnabled = (_secRaw['_enabled'] as Record<string, boolean> | undefined) ?? { ...DEFAULT_ENABLED };

  // ── Grouped data ─────────────────────────────────────────────────────────
  const { groups: logGroups, keys: logKeys } = groupLogsByDate(logs);

  const filteredIssues = issues.filter((issue) => {
    const d = new Date(issue.created_at);
    const now = new Date();
    const dateOk =
      issueFilterDate === 'All' ||
      (issueFilterDate === 'Today' && d.toDateString() === now.toDateString()) ||
      (issueFilterDate === 'Last 7 days' && now.getTime() - d.getTime() < 7 * 86_400_000) ||
      (issueFilterDate === 'Last 30 days' && now.getTime() - d.getTime() < 30 * 86_400_000);
    const nameOk = !issueFilterName.trim() || issue.name.toLowerCase().includes(issueFilterName.toLowerCase());
    return dateOk && nameOk;
  });
  const { groups: issueGroups, keys: issueKeys } = groupIssuesByDate(filteredIssues);

  // ── Selection helpers ────────────────────────────────────────────────────
  function toggleId(id: number) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    setSelectedIds((prev) => prev.length === logs.length ? [] : logs.map((l) => l.id));
  }
  function exitSelect() { setSelectMode(false); setSelectedIds([]); }

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    exitSelect();
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    const noun = selectedIds.length === 1 ? 'submission' : 'submissions';
    if (!window.confirm(`Delete ${selectedIds.length} selected ${noun}? This cannot be undone.`)) return;
    setDeleting(true);
    try { await onDeleteSelected(selectedIds); exitSelect(); }
    catch { alert('Delete failed. Please try again.'); }
    finally { setDeleting(false); }
  }

  async function handleDeleteAll() {
    if (!window.confirm(`Delete ALL ${logs.length} submissions? This cannot be undone.`)) return;
    setDeleting(true);
    try { await onDeleteAll(); exitSelect(); }
    catch { alert('Delete failed. Please try again.'); }
    finally { setDeleting(false); }
  }

  function handleEditLocChange(loc: string) {
    setEditLoc(loc);
    setEditSec(getSections(loc)[0] ?? '');
    setNewSecName('');
  }

  function handleAddSection() {
    if (!newSecName.trim()) return;
    onAddSection(editLoc, newSecName);
    setNewSecName('');
  }

  const selectStyle = {
    background: C.surface, boxShadow: SH.upSm, border: 'none',
    borderRadius: '10px', padding: '0.45rem 0.75rem',
    fontSize: '0.7rem', color: C.t3, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <button
            onClick={onExit}
            type="button"
            style={{ background: 'none', border: 'none', color: C.t4, fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke={C.t4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exit
          </button>
          <div style={{ fontFamily: "Georgia,'Book Antiqua',Palatino,serif", fontStyle: 'italic', fontSize: '1.25rem', color: C.t1, letterSpacing: '-0.02em' }}>mise</div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.t4 }}>Admin</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }} role="tablist">
          {([['logs', 'Submission Log'], ['results', 'Results'], ['issues', 'Issue Log'], ['edit', 'Edit Checklists']] as [AdminTab, string][]).map(([id, label]) => (
            <TabBtn key={id} label={label} active={activeTab === id} onClick={() => handleTabChange(id)} />
          ))}
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        {activeTab === 'results' && (
          <ResultsView logs={logs} logsLoading={logsLoading} logsErr={logsErr} onRefresh={onRefreshLogs} />
        )}

        {/* ── Submission Log ───────────────────────────────────────────── */}
        {activeTab === 'logs' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <ActionBtn onClick={() => downloadCSV(logs)} disabled={logs.length === 0 || deleting} variant="teal">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v8M4 9l4 4 4-4" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                CSV
              </ActionBtn>
              <ActionBtn onClick={onRefreshLogs} disabled={deleting}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8a5 5 0 1 0 1.5-3.5" stroke={C.t3} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 4.5V8h3.5" stroke={C.t3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Refresh
              </ActionBtn>
              {!selectMode ? (
                <ActionBtn onClick={() => setSelectMode(true)} disabled={logs.length === 0 || deleting}>Select</ActionBtn>
              ) : (
                <>
                  <ActionBtn onClick={toggleAll}>{selectedIds.length === logs.length ? 'Deselect all' : 'Select all'}</ActionBtn>
                  <ActionBtn onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || deleting} variant="danger">
                    {deleting ? 'Deleting…' : `Delete (${selectedIds.length})`}
                  </ActionBtn>
                  <ActionBtn onClick={exitSelect}>Cancel</ActionBtn>
                </>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <ActionBtn onClick={handleDeleteAll} disabled={logs.length === 0 || deleting} variant="danger">Delete all</ActionBtn>
              </div>
            </div>

            {logsLoading && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>Loading…</p>}
            {logsErr && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.pink, fontSize: '0.875rem' }}>Failed to load. Check connection.</p>}
            {!logsLoading && !logsErr && logs.length === 0 && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>No submissions yet.</p>}

            {/* Grouped log list */}
            {!logsLoading && !logsErr && logKeys.map((dk) => {
              const dateGroup = logGroups[dk];
              const totalInDate = Object.values(dateGroup ?? {}).reduce((a, arr) => a + arr.length, 0);
              return (
                <div key={dk}>
                  <DateHdr label={dk} count={totalInDate} />
                  {Object.keys(dateGroup ?? {}).map((locationKey) => (
                    <div key={locationKey}>
                      {/* Location sub-header */}
                      <div style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.t4, marginBottom: '0.5rem', marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '3px', height: '3px', background: C.t4, borderRadius: '50%', flexShrink: 0 }} />
                        {locationKey}
                      </div>

                      {dateGroup[locationKey].map((log) => {
                        const isSelected = selectedIds.includes(log.id);
                        const isExpanded = expandedId === log.id;
                        const scoreColour = log.completed === log.total ? C.teal : C.amber;

                        return (
                          <div
                            key={log.id}
                            style={{
                              background: isSelected ? 'rgba(232,41,122,0.08)' : C.surface,
                              boxShadow: isSelected
                                ? `5px 5px 12px rgba(0,0,0,0.55), -3px -3px 8px rgba(85,65,185,0.2), inset 0 0 0 1.5px rgba(232,41,122,0.3)`
                                : SH.upMd,
                              borderRadius: '14px',
                              padding: '0.875rem 1rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.18s',
                            }}
                            onClick={() => selectMode ? toggleId(log.id) : setExpandedId(isExpanded ? null : log.id)}
                          >
                            {selectMode && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleId(log.id)}
                                style={{ width: '1.1rem', height: '1.1rem', accentColor: C.teal, cursor: 'pointer', flexShrink: 0, marginTop: '0.15rem' }}
                                aria-label={`Select submission by ${log.name}`}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                  <p style={{ fontWeight: 500, fontSize: '0.875rem', color: C.t1, marginBottom: '0.15rem' }}>{log.name}</p>
                                  <p style={{ fontSize: '0.68rem', color: C.t3 }}>{log.section} · {log.shift}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                                  <p style={{ fontSize: '0.63rem', color: C.t4, marginBottom: '0.2rem' }}>
                                    {new Date(log.created_at).toLocaleString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: scoreColour }}>{log.completed}/{log.total}</p>
                                </div>
                              </div>

                              {/* Expanded task list */}
                              {!selectMode && isExpanded && (
                                <div style={{ marginTop: '0.7rem', paddingTop: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                  {(log.tasks ?? []).map((t, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', marginBottom: '0.3rem', color: t.done ? C.t4 : C.amber }}>
                                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                        {t.done
                                          ? <path d="M2 7l3.5 3.5L12 4" stroke={C.teal} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                          : <circle cx="7" cy="7" r="3" stroke={C.amber} strokeWidth="1.25" />}
                                      </svg>
                                      <span style={t.done ? { textDecoration: 'line-through' } : {}}>{t.task}</span>
                                      {t.photoUrl && (
                                        <a href={t.photoUrl} target="_blank" rel="noreferrer" style={{ color: C.teal, marginLeft: 'auto', flexShrink: 0, fontSize: '0.63rem' }}>📷 view</a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Issue Log ────────────────────────────────────────────────── */}
        {activeTab === 'issues' && (
          <div>
            {/* Issue filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={issueFilterName}
                onChange={(e) => setIssueFilterName(e.target.value)}
                placeholder="Filter by name…"
                style={{ flex: 1, minWidth: '120px', background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '10px', padding: '0.5rem 0.75rem', color: C.t1, fontSize: '0.72rem', fontFamily: 'inherit', outline: 'none' }}
              />
              <select value={issueFilterDate} onChange={(e) => setIssueFilterDate(e.target.value)} style={selectStyle} aria-label="Filter by date">
                {['All', 'Today', 'Last 7 days', 'Last 30 days'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ActionBtn onClick={onRefreshIssues} disabled={issuesLoading} variant="teal">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8a5 5 0 1 0 1.5-3.5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 4.5V8h3.5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ActionBtn>
            </div>

            {issuesLoading && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>Loading…</p>}
            {issuesErr && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.pink, fontSize: '0.875rem' }}>Failed to load.</p>}
            {!issuesLoading && !issuesErr && issueKeys.length === 0 && <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>No issues match filters.</p>}

            {/* Grouped issue list */}
            {!issuesLoading && !issuesErr && issueKeys.map((dk) => (
              <div key={dk}>
                <DateHdr label={dk} />
                {(issueGroups[dk] ?? []).map((issue) => {
                  const isExpanded = expandedIssueId === issue.id;
                  return (
                    <div
                      key={issue.id}
                      style={{ background: C.surface, boxShadow: SH.upMd, borderRadius: '14px', padding: '0.875rem 1rem', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.18s' }}
                      onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        {/* Camera icon */}
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(196,128,58,0.1)', border: '1px solid rgba(196,128,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={C.amber} strokeWidth="1.25" />
                            <circle cx="8" cy="9" r="2" stroke={C.amber} strokeWidth="1.25" />
                            <path d="M6 5l1-2h2l1 2" stroke={C.amber} strokeWidth="1.25" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: C.t1, marginBottom: '0.15rem' }}>{issue.item_name}</div>
                          <div style={{ fontSize: '0.68rem', color: C.t3 }}>Logged by {issue.name}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.63rem', color: C.t4 }}>
                            {new Date(issue.created_at).toLocaleString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {issue.photo_url && (
                            <div style={{ width: '46px', height: '46px', borderRadius: '8px', marginTop: '0.35rem', background: C.well, boxShadow: SH.downSm, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={C.amber} strokeWidth="1.25" />
                                <circle cx="8" cy="9" r="2" stroke={C.amber} strokeWidth="1.25" />
                                <path d="M6 5l1-2h2l1 2" stroke={C.amber} strokeWidth="1.25" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded: full photo */}
                      {isExpanded && issue.photo_url && (
                        <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <a href={issue.photo_url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(196,128,58,0.2)' }}>
                            <img src={issue.photo_url} alt={issue.item_name} style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '200px' }} />
                          </a>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.625rem' }}>
                            <a href={issue.photo_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: C.teal, textDecoration: 'none', border: '1px solid rgba(13,216,196,0.25)', borderRadius: '8px', padding: '0.35rem 0.75rem' }}>
                              View full photo →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── Edit Checklists ──────────────────────────────────────────── */}
        {activeTab === 'edit' && (
          <div>
            {/* Live-save indicator */}
            <div style={{ fontSize: '0.7rem', color: C.t4, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: configSaving ? C.amber : C.teal, boxShadow: configSaving ? '0 0 5px rgba(196,128,58,0.5)' : '0 0 5px rgba(13,216,196,0.5)' }} />
              {configSaving ? 'Saving…' : 'Changes save instantly to all devices'}
            </div>

            {/* Location chips */}
            <SecLbl>Location</SecLbl>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {LOCS.map((loc) => (
                <Chip key={loc} label={loc} active={editLoc === loc} onClick={() => handleEditLocChange(loc)} />
              ))}
            </div>

            {/* Section chips with × remove and + add */}
            <SecLbl>Section</SecLbl>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {eSections.map((sec) => (
                <div key={sec} style={{ display: 'flex', alignItems: 'center', background: editSec === sec ? C.teal : C.surface, boxShadow: editSec === sec ? SH.teal : SH.upSm, borderRadius: '10px', overflow: 'hidden', transition: 'all 0.18s' }}>
                  <button
                    onClick={() => setEditSec(sec)}
                    type="button"
                    style={{ background: 'none', border: 'none', padding: '0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: editSec === sec ? 600 : 500, color: editSec === sec ? '#0C0A22' : C.t3, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {sec}
                  </button>
                  {eSections.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveSection(editLoc, sec); }}
                      type="button"
                      style={{ background: 'none', border: 'none', borderLeft: `1px solid ${editSec === sec ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)'}`, padding: '0.5rem', fontSize: '0.75rem', color: editSec === sec ? 'rgba(0,0,0,0.5)' : C.t4, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {/* Add new section */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newSecName.trim()) handleAddSection(); }}
                  placeholder="New section…"
                  style={{ background: C.well, boxShadow: SH.downSm, border: 'none', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: C.t1, fontFamily: 'inherit', outline: 'none', width: '120px' }}
                />
                <button
                  onClick={handleAddSection}
                  type="button"
                  style={{ background: C.surface, boxShadow: SH.upSm, border: 'none', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: C.t3, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                >
                  + Add
                </button>
              </div>
            </div>

            {editSec && (
              <div>
                {/* Active shifts toggle */}
                <SecLbl>Active shifts — {editSec}</SecLbl>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {SHIFTS.map((sh) => {
                    const on = eEnabled[sh] !== false;
                    return (
                      <button
                        key={sh}
                        onClick={() => onToggleShiftEnabled(editLoc, editSec, sh)}
                        type="button"
                        style={{ background: on ? C.teal : C.surface, boxShadow: on ? SH.teal : SH.upSm, border: 'none', borderRadius: '8px', padding: '0.4rem 0.625rem', fontSize: '0.65rem', fontWeight: on ? 600 : 500, color: on ? '#0C0A22' : C.t3, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
                      >
                        {sh}
                      </button>
                    );
                  })}
                </div>

                {/* Task editor */}
                <SecLbl>Tasks</SecLbl>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {SHIFTS.map((sh) => (
                    <Chip key={sh} label={sh} active={editShift === sh} onClick={() => setEditShift(sh)} />
                  ))}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  {(eTasks as Array<{ text: string; requiresPhoto: boolean; examplePhotoUrl?: string | null }>).map((task, i) => (
                    <EditTaskRow
                      key={i}
                      task={task}
                      index={i}
                      onUpdateText={(idx, text) => onUpdateTaskText(editLoc, editSec, editShift, idx, text)}
                      onTogglePhoto={(idx) => onToggleTaskPhoto(editLoc, editSec, editShift, idx)}
                      onSetExample={(idx, url) => onSetExamplePhoto(editLoc, editSec, editShift, idx, url)}
                      onRemove={(idx) => onRemoveTask(editLoc, editSec, editShift, idx)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => onAddTask(editLoc, editSec, editShift)}
                  type="button"
                  style={{ width: '100%', background: 'transparent', border: '1px dashed #2A2648', borderRadius: '14px', padding: '0.875rem', fontSize: '0.8rem', color: C.t4, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
                >
                  + Add task
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
