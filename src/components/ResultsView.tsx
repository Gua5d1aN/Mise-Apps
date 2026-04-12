/**
 * ResultsView — analytics dashboard within the admin panel.
 *
 * Displays: total submissions, completion rate, incomplete count,
 * per-section completion bars, and top 5 most-missed tasks with ranked colours.
 *
 * Default date filter is "Last 7 days" (not "All") to keep the view meaningful
 * in active venues with large log histories.
 *
 * @author Joshua Bosen
 */
import { useState } from 'react';
import { C, SH } from '../styles/tokens';
import { ActionBtn, SecLbl } from './ui';
import { LOCS, SHIFTS } from '../constants';
import type { ChecklistLog, DateFilter } from '../types';

interface ResultsViewProps {
  logs: ChecklistLog[];
  logsLoading: boolean;
  logsErr: boolean;
  onRefresh: () => void;
}

function isWithinDate(log: ChecklistLog, filter: DateFilter): boolean {
  if (filter === 'All') return true;
  const d = new Date(log.created_at);
  const now = new Date();
  if (filter === 'Today') return d.toDateString() === now.toDateString();
  if (filter === 'Last 7 days') return now.getTime() - d.getTime() < 7 * 86_400_000;
  if (filter === 'Last 30 days') return now.getTime() - d.getTime() < 30 * 86_400_000;
  return true;
}

export function ResultsView({ logs, logsLoading, logsErr, onRefresh }: ResultsViewProps) {
  const [filterLoc, setFilterLoc] = useState('All');
  const [filterShift, setFilterShift] = useState('All');
  const [filterDate, setFilterDate] = useState<DateFilter>('Last 7 days');

  const filtered = logs.filter((l) =>
    (filterLoc === 'All' || l.location === filterLoc) &&
    (filterShift === 'All' || l.shift === filterShift) &&
    isWithinDate(l, filterDate),
  );

  const total = filtered.length;
  const fullyComplete = filtered.filter((l) => l.completed === l.total).length;
  const incomplete = total - fullyComplete;
  const compRate = total > 0 ? Math.round((fullyComplete / total) * 100) : 0;

  const bySection: Record<string, { done: number; total: number }> = {};
  for (const log of filtered) {
    const key = `${log.location} · ${log.section}`;
    if (!bySection[key]) bySection[key] = { done: 0, total: 0 };
    bySection[key].total++;
    if (log.completed === log.total) bySection[key].done++;
  }

  const missedCounts: Record<string, number> = {};
  for (const log of filtered) {
    for (const t of log.tasks ?? []) {
      if (!t.done) missedCounts[t.task] = (missedCounts[t.task] ?? 0) + 1;
    }
  }
  const topMissed = Object.entries(missedCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  const selectStyle = {
    background: C.surface, boxShadow: SH.upSm, border: 'none',
    borderRadius: '10px', padding: '0.45rem 0.75rem',
    fontSize: '0.7rem', color: C.t3, fontFamily: 'inherit', outline: 'none',
  };
  const dateOpts: DateFilter[] = ['All', 'Today', 'Last 7 days', 'Last 30 days'];

  if (logsLoading) return <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>Loading…</p>;
  if (logsErr) return <p style={{ textAlign: 'center', padding: '3rem 0', color: C.pink, fontSize: '0.875rem' }}>Failed to load.</p>;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <ActionBtn onClick={onRefresh} variant="teal">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8a5 5 0 1 0 1.5-3.5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 4.5V8h3.5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </ActionBtn>
        <select value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} style={selectStyle} aria-label="Filter by location">
          <option value="All">All</option>
          {LOCS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} style={selectStyle} aria-label="Filter by shift">
          <option value="All">All</option>
          {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDate} onChange={(e) => setFilterDate(e.target.value as DateFilter)} style={selectStyle} aria-label="Filter by date">
          {dateOpts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {total === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem 0', color: C.t4, fontSize: '0.875rem' }}>No submissions match filters.</p>
      ) : (
        <>
          {/* Stat boxes */}
          <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.75rem' }}>
            {[
              { v: total, l: 'Submissions', c: C.t1 },
              { v: `${compRate}%`, l: 'Completion', c: C.teal },
              { v: incomplete, l: 'Incomplete', c: incomplete > 0 ? C.amber : C.teal },
            ].map((s) => (
              <div key={s.l} style={{ flex: 1, background: C.surface, borderRadius: '16px', boxShadow: SH.upMd, padding: '1rem 0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.c, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.t4, marginTop: '0.4rem' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Completion by section */}
          <SecLbl>Completion by section</SecLbl>
          <div style={{ marginBottom: '1.5rem' }}>
            {Object.entries(bySection).sort(([a], [b]) => a.localeCompare(b)).map(([key, counts]) => {
              const pct = Math.round((counts.done / counts.total) * 100);
              const bc = pct === 100 ? C.teal : pct >= 50 ? C.amber : C.pink;
              return (
                <div key={key} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', color: C.t2 }}>{key}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: bc }}>{pct}%</span>
                  </div>
                  <div style={{ background: C.well, boxShadow: SH.downSm, borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '100px', width: `${pct}%`, background: bc, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Most missed tasks */}
          {topMissed.length > 0 && (
            <>
              <SecLbl>Most missed tasks</SecLbl>
              {topMissed.map(([taskName, count], i) => {
                const rankColour = [C.pink, C.amber, C.t3, C.t4, C.t4][i] ?? C.t4;
                const rankBg = i === 0 ? 'rgba(232,41,122,0.12)' : i === 1 ? 'rgba(196,128,58,0.12)' : 'rgba(122,114,160,0.12)';
                const rankBorder = i === 0 ? 'rgba(232,41,122,0.2)' : i === 1 ? 'rgba(196,128,58,0.2)' : 'rgba(122,114,160,0.2)';
                return (
                  <div key={taskName} style={{ background: C.surface, boxShadow: SH.upSm, borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: rankBg, border: `1px solid ${rankBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, color: rankColour }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: C.t2 }}>{taskName}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: rankColour, flexShrink: 0, marginLeft: '0.5rem' }}>{count}× missed</span>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
