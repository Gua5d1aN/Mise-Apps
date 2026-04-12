/**
 * App — root component for Mise Checklists.
 *
 * Owns all application state and renders the correct page based on `view`.
 *
 * State groups:
 *   Config   — checklist configuration from Supabase
 *   Session  — home screen selections (name, loc, sec, shift)
 *   Checklist — active task state (checked, photos, upload, submit)
 *   Issue    — maintenance log form state
 *   Admin    — logs, issues, deletion state
 *
 * @author Joshua Bosen
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchConfig, saveConfig, fetchLogs, insertLog, deleteLogsByIds, deleteAllLogs, insertIssue, fetchIssues, resolveIssue } from './lib/api';
import { uploadPhoto } from './lib/storage';
import { deepClone } from './lib/utils';
import { DEFAULT_TASKS } from './constants/defaultTasks';
import { ADMIN_PW, STRUCTURE, DEFAULT_ENABLED, SHIFTS } from './constants';

import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { ChecklistPage } from './pages/ChecklistPage';
import { SuccessPage } from './pages/SuccessPage';
import { IssueLogPage } from './pages/IssueLogPage';
import { IssueSuccessPage } from './pages/IssueSuccessPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';

import type { AppView, ChecklistConfig, ChecklistLog, IssueLog, Task } from './types';

// Global base styles injected once via <style> tag
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: #181530; color: #C8C0E8; font-family: 'Clash Grotesk', system-ui, sans-serif; min-height: 100vh; }
  button, input, select { font-family: inherit; }
  ::placeholder { color: #4A4468; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2A2648; border-radius: 2px; }
  select option { background: #1D1A38; color: #fff; }
  .nm-pill:active { transform: scale(0.97); }
  .nm-card:active { box-shadow: inset 4px 4px 10px rgba(0,0,0,0.5),inset -3px -3px 8px rgba(85,65,185,0.15) !important; transform: scale(0.99); }
  .nm-btn-pink:active { box-shadow: inset 3px 3px 8px rgba(185,15,75,0.6),inset -1px -1px 5px rgba(255,85,155,0.2) !important; transform: scale(0.98); }
  .nm-btn-amber:active { box-shadow: inset 3px 3px 7px rgba(0,0,0,0.5),inset -2px -2px 5px rgba(85,65,185,0.15) !important; transform: scale(0.98); }
  .nm-btn-sm:active { box-shadow: inset 3px 3px 6px rgba(0,0,0,0.5),inset -2px -2px 4px rgba(85,65,185,0.12) !important; }
`;

export function App() {
  // ── Navigation ─────────────────────────────────────────────────────────
  const [view, setView] = useState<AppView>('loading');

  // ── Config ──────────────────────────────────────────────────────────────
  const [config, setConfig] = useState<ChecklistConfig>(deepClone(DEFAULT_TASKS) as unknown as ChecklistConfig);
  const [configSaving, setConfigSaving] = useState(false);

  // ── Session ─────────────────────────────────────────────────────────────
  const [staffName, setStaffName] = useState('');
  const [location, setLocation] = useState('');
  const [section, setSection] = useState('');
  const [shift, setShift] = useState('');

  // ── Checklist ────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [photos, setPhotos] = useState<(string | null)[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState(-1);
  const [photoUploadError, setPhotoUploadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // ── Issue log ────────────────────────────────────────────────────────────
  const [issueName, setIssueName] = useState('');
  const [issueItem, setIssueItem] = useState('');
  const [issuePhotoUrl, setIssuePhotoUrl] = useState<string | null>(null);
  const [issueUploading, setIssueUploading] = useState(false);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueError, setIssueError] = useState('');

  // ── Admin ────────────────────────────────────────────────────────────────
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);
  const [logs, setLogs] = useState<ChecklistLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsErr, setLogsErr] = useState(false);
  const [issues, setIssues] = useState<IssueLog[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesErr, setIssuesErr] = useState(false);

  // ── Config load on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const remote = await fetchConfig();
        setConfig(remote ?? deepClone(DEFAULT_TASKS) as unknown as ChecklistConfig);
      } catch {
        setConfig(deepClone(DEFAULT_TASKS) as unknown as ChecklistConfig);
      } finally {
        setView('welcome');
      }
    }
    void load();
  }, []);

  // ── Log / issue fetch when entering admin ────────────────────────────────
  const loadLogs = useCallback(async () => {
    setLogsLoading(true); setLogsErr(false);
    try { setLogs(await fetchLogs()); }
    catch { setLogsErr(true); }
    finally { setLogsLoading(false); }
  }, []);

  const loadIssues = useCallback(async () => {
    setIssuesLoading(true); setIssuesErr(false);
    try { setIssues(await fetchIssues()); }
    catch { setIssuesErr(true); }
    finally { setIssuesLoading(false); }
  }, []);

  useEffect(() => {
    if (view === 'admin') { void loadLogs(); void loadIssues(); }
  }, [view, loadLogs, loadIssues]);

  // ── Config persistence ───────────────────────────────────────────────────
  function persistConfig(updated: ChecklistConfig) {
    setConfig(updated);
    setConfigSaving(true);
    saveConfig(updated)
      .catch((e) => console.error('[Mise] persistConfig:', e))
      .finally(() => setConfigSaving(false));
  }

  // ── Config helpers ───────────────────────────────────────────────────────
  function getSections(loc: string): string[] {
    const locData = config[loc] as Record<string, unknown> | undefined;
    if (!locData) return STRUCTURE[loc] ?? [];
    return (locData['_sections'] as string[] | undefined) ?? STRUCTURE[loc] ?? [];
  }

  function getEnabledShifts(loc: string, sec: string): string[] {
    const secData = (config[loc] as Record<string, unknown> | undefined)?.[sec] as Record<string, unknown> | undefined;
    const enabled = (secData?.['_enabled'] as Record<string, boolean> | undefined) ?? { ...DEFAULT_ENABLED };
    return SHIFTS.filter((sh) => enabled[sh] !== false);
  }

  // ── Navigation helpers ───────────────────────────────────────────────────
  function goHome() {
    setLocation(''); setSection(''); setShift(''); setStaffName('');
    setSubmitError(false); setPhotoUploadError(false);
    setView('welcome');
  }

  function resetIssueForm() {
    setIssueName(''); setIssueItem(''); setIssuePhotoUrl(null);
    setIssueUploading(false); setIssueSubmitting(false); setIssueError('');
  }

  // ── Checklist actions ────────────────────────────────────────────────────
  function startChecklist() {
    const t = (config[location]?.[section] as Record<string, unknown> | undefined)?.[shift] as Task[] ?? [];
    setTasks(t);
    setChecked(new Array(t.length).fill(false));
    setPhotos(new Array(t.length).fill(null));
    setSubmitError(false); setPhotoUploadError(false);
    setView('checklist');
  }

  function toggleTask(i: number) {
    setChecked((prev) => prev.map((v, idx) => idx === i ? !v : v));
  }

  async function handlePhotoUpload(file: File, i: number) {
    setUploadingIndex(i); setPhotoUploadError(false);
    try {
      const url = await uploadPhoto(file, location, section, shift, i);
      setPhotos((prev) => prev.map((p, idx) => idx === i ? url : p));
    } catch { setPhotoUploadError(true); }
    finally { setUploadingIndex(-1); }
  }

  async function submitChecklist() {
    const completedCount = tasks.filter((t, i) => checked[i] && (!t.requiresPhoto || photos[i] !== null)).length;
    setSubmitting(true); setSubmitError(false);
    try {
      await insertLog({
        name: staffName.trim(), location, section, shift,
        completed: completedCount, total: tasks.length,
        tasks: tasks.map((t, i) => ({ task: t.text, done: checked[i] ?? false, requiresPhoto: t.requiresPhoto, photoUrl: photos[i] ?? null })),
      });
      setView('success');
    } catch { setSubmitError(true); }
    finally { setSubmitting(false); }
  }

  // ── Issue actions ────────────────────────────────────────────────────────
  async function handleIssuePhotoSelect(file: File) {
    setIssueUploading(true); setIssueError('');
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const url = await uploadPhoto(file, 'issues', issueItem.replace(/[^a-zA-Z0-9]/g, '_'), 'issue', Date.now());
      void ext;
      setIssuePhotoUrl(url);
    } catch { setIssueError('Photo upload failed. Try again.'); }
    finally { setIssueUploading(false); }
  }

  async function submitIssue() {
    if (!issueName.trim() || !issueItem.trim() || !issuePhotoUrl) {
      setIssueError('Please fill all fields and add a photo.'); return;
    }
    setIssueSubmitting(true); setIssueError('');
    try {
      await insertIssue({ name: issueName.trim(), item_name: issueItem.trim(), photo_url: issuePhotoUrl });
      setView('issueSuccess');
    } catch { setIssueError('Submission failed. Check connection.'); }
    finally { setIssueSubmitting(false); }
  }

  // ── Admin login ──────────────────────────────────────────────────────────
  function tryAdminLogin() {
    if (adminPassword === ADMIN_PW) {
      setView('admin'); setAdminPassword(''); setAdminLoginError(false);
    } else { setAdminLoginError(true); }
  }

  // ── Config edit actions ──────────────────────────────────────────────────
  function updateTaskText(loc: string, sec: string, sh: string, i: number, text: string) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    const tasks = u[loc]?.[sec]?.[sh] as Array<Record<string, unknown>> | undefined;
    if (tasks?.[i]) { tasks[i]['text'] = text; persistConfig(u as unknown as ChecklistConfig); }
  }

  function toggleTaskPhoto(loc: string, sec: string, sh: string, i: number) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    const tasks = u[loc]?.[sec]?.[sh] as Array<Record<string, unknown>> | undefined;
    if (tasks?.[i]) { tasks[i]['requiresPhoto'] = !tasks[i]['requiresPhoto']; persistConfig(u as unknown as ChecklistConfig); }
  }

  function setExamplePhoto(loc: string, sec: string, sh: string, i: number, url: string | null) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    const tasks = u[loc]?.[sec]?.[sh] as Array<Record<string, unknown>> | undefined;
    if (tasks?.[i]) { tasks[i]['examplePhotoUrl'] = url ?? null; persistConfig(u as unknown as ChecklistConfig); }
  }

  function removeTask(loc: string, sec: string, sh: string, i: number) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    (u[loc]?.[sec]?.[sh] as unknown[])?.splice(i, 1);
    persistConfig(u as unknown as ChecklistConfig);
  }

  function addTask(loc: string, sec: string, sh: string) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    const arr = u[loc]?.[sec]?.[sh] as unknown[] | undefined;
    if (arr) { arr.push({ text: 'New task', requiresPhoto: false }); persistConfig(u as unknown as ChecklistConfig); }
  }

  function toggleShiftEnabled(loc: string, sec: string, sh: string) {
    const u = deepClone(config) as Record<string, Record<string, Record<string, unknown>>>;
    const secData = u[loc]?.[sec] as Record<string, unknown> | undefined;
    if (!secData) return;
    if (!secData['_enabled']) secData['_enabled'] = deepClone(DEFAULT_ENABLED);
    const enabled = secData['_enabled'] as Record<string, boolean>;
    enabled[sh] = !enabled[sh];
    persistConfig(u as unknown as ChecklistConfig);
  }

  function addSection(loc: string, name: string) {
    const trimmed = name.trim(); if (!trimmed) return;
    const u = deepClone(config) as Record<string, Record<string, unknown>>;
    if (!u[loc]) u[loc] = {};
    const locData = u[loc] as Record<string, unknown>;
    if (!Array.isArray(locData['_sections'])) locData['_sections'] = deepClone(STRUCTURE[loc] ?? []);
    const secs = locData['_sections'] as string[];
    if (secs.includes(trimmed)) return;
    secs.push(trimmed);
    const newSec: Record<string, unknown> = { _enabled: deepClone(DEFAULT_ENABLED) };
    SHIFTS.forEach((sh) => { newSec[sh] = []; });
    locData[trimmed] = newSec;
    persistConfig(u as unknown as ChecklistConfig);
  }

  function removeSection(loc: string, sec: string) {
    if (!window.confirm(`Remove section '${sec}' and all its tasks? This cannot be undone.`)) return;
    const u = deepClone(config) as Record<string, Record<string, unknown>>;
    const locData = u[loc] as Record<string, unknown> | undefined;
    if (!locData) return;
    locData['_sections'] = ((locData['_sections'] as string[] | undefined) ?? []).filter((s) => s !== sec);
    delete locData[sec];
    persistConfig(u as unknown as ChecklistConfig);
  }


  // ── Issue resolve handler ─────────────────────────────────────────────────
  async function handleResolveIssue(id: number, resolved: boolean) {
    await resolveIssue(id, resolved);
    // Update local state immediately so the UI reflects the change
    // without needing a full refetch
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, resolved, resolved_at: resolved ? new Date().toISOString() : null }
          : issue,
      ),
    );
  }

  // ── Admin deletion ───────────────────────────────────────────────────────
  async function handleDeleteSelected(ids: number[]) {
    await deleteLogsByIds(ids);
    setLogs((prev) => prev.filter((l) => !ids.includes(l.id)));
  }

  async function handleDeleteAll() {
    await deleteAllLogs();
    setLogs([]);
  }

  // ── Derived checklist stats for SuccessPage ──────────────────────────────
  const completedCount = tasks.filter((t, i) => checked[i] && (!t.requiresPhoto || photos[i] !== null)).length;
  const photosUploaded = photos.filter(Boolean).length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>

      {view === 'loading' && (
        <div style={{ minHeight: '100vh', background: '#181530', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: '#4A4468', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Loading…</p>
        </div>
      )}

      {view === 'welcome' && (
        <WelcomePage
          onChecklists={() => setView('home')}
          onMaintenanceLog={() => { resetIssueForm(); setView('issueLog'); }}
          onAdmin={() => setView('adminLogin')}
        />
      )}

      {view === 'home' && (
        <HomePage
          name={staffName} location={location} section={section} shift={shift}
          config={config}
          onNameChange={setStaffName} onLocationChange={setLocation}
          onSectionChange={setSection} onShiftChange={setShift}
          onStart={startChecklist}
          onBack={() => setView('welcome')}
          getSections={getSections} getEnabledShifts={getEnabledShifts}
        />
      )}

      {view === 'checklist' && (
        <ChecklistPage
          staffName={staffName} location={location} section={section} shift={shift}
          tasks={tasks} checked={checked} photos={photos}
          uploadingIndex={uploadingIndex} submitting={submitting}
          photoUploadError={photoUploadError} submitError={submitError}
          onBack={goHome} onToggleTask={toggleTask}
          onUploadPhoto={handlePhotoUpload} onSubmit={submitChecklist}
        />
      )}

      {view === 'success' && (
        <SuccessPage
          staffName={staffName} location={location} section={section} shift={shift}
          completed={completedCount} total={tasks.length} photosUploaded={photosUploaded}
          onNewChecklist={() => { setView('home'); setLocation(''); setSection(''); setShift(''); }}
          onHome={goHome}
        />
      )}

      {view === 'issueLog' && (
        <IssueLogPage
          name={issueName} item={issueItem} photoUrl={issuePhotoUrl}
          uploading={issueUploading} submitting={issueSubmitting} error={issueError}
          onNameChange={setIssueName} onItemChange={setIssueItem}
          onPhotoSelect={handleIssuePhotoSelect}
          onRemovePhoto={() => setIssuePhotoUrl(null)}
          onSubmit={submitIssue}
          onBack={() => { resetIssueForm(); setView('welcome'); }}
        />
      )}

      {view === 'issueSuccess' && (
        <IssueSuccessPage
          staffName={issueName} itemName={issueItem}
          onHome={() => { resetIssueForm(); setView('welcome'); }}
        />
      )}

      {view === 'adminLogin' && (
        <AdminLoginPage
          password={adminPassword} hasError={adminLoginError}
          onPasswordChange={(pw) => { setAdminPassword(pw); if (adminLoginError) setAdminLoginError(false); }}
          onSubmit={tryAdminLogin}
          onBack={() => { setView('welcome'); setAdminPassword(''); setAdminLoginError(false); }}
        />
      )}

      {view === 'admin' && (
        <AdminPage
          config={config} configSaving={configSaving}
          logs={logs} logsLoading={logsLoading} logsErr={logsErr}
          issues={issues} issuesLoading={issuesLoading} issuesErr={issuesErr}
          onExit={goHome}
          onRefreshLogs={loadLogs} onRefreshIssues={loadIssues}
          onDeleteSelected={handleDeleteSelected} onDeleteAll={handleDeleteAll}
          onUpdateTaskText={updateTaskText} onToggleTaskPhoto={toggleTaskPhoto}
          onSetExamplePhoto={setExamplePhoto}
          onRemoveTask={removeTask} onAddTask={addTask}
          onToggleShiftEnabled={toggleShiftEnabled}
          onAddSection={addSection} onRemoveSection={removeSection}
          getSections={getSections}
          onResolveIssue={handleResolveIssue}
        />
      )}
    </>
  );
}
