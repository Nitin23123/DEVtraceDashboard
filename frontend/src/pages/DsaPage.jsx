import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getProblems, toggleProblem as toggleProblemApi } from '../api/dsa';
import Spinner from '../components/Spinner';
import { Card, CardHead, Label, Bar, Chip, DIFF_TONE, GradButton, Page } from '../components/ui';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IconFlame = <Icon d={<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />} />;
const IconGrid = <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} />;

/** Skill label derived from completion — no invented "level" system. */
function masteryLabel(pct) {
  if (pct >= 90) return 'Advanced';
  if (pct >= 60) return 'Proficient';
  if (pct >= 30) return 'Intermediate';
  if (pct > 0) return 'Beginner';
  return 'Not started';
}

export default function DsaPage() {
  const { token } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Set());

  const authToken = token || localStorage.getItem('token');

  useEffect(() => { fetchProblems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProblems() {
    setLoading(true);
    try {
      const data = await getProblems(authToken);
      if (Array.isArray(data)) setDays(data);
      else setError(data.error || 'Failed to load DSA problems');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  async function toggle(problemId) {
    try {
      const { completed } = await toggleProblemApi(authToken, problemId);
      setDays((prev) => prev.map((day) => ({
        ...day,
        problems: day.problems.map((p) => (p.id === problemId ? { ...p, completed } : p)),
      })));
    } catch { setError('Failed to update progress'); }
  }

  function toggleDay(dayNumber) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) next.delete(dayNumber); else next.add(dayNumber);
      return next;
    });
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const allProblems = days.flatMap((d) => d.problems || []);
  const total = allProblems.length;
  const solved = allProblems.filter((p) => p.completed).length;
  const pct = total ? (solved / total) * 100 : 0;

  const byDifficulty = ['Easy', 'Medium', 'Hard'].map((diff) => {
    const set = allProblems.filter((p) => p.difficulty === diff);
    return { diff, total: set.length, done: set.filter((p) => p.completed).length };
  });

  // Categories = topics, ordered by size.
  const topicMap = {};
  days.forEach((d) => {
    const key = d.topic || 'Other';
    if (!topicMap[key]) topicMap[key] = { topic: key, total: 0, done: 0 };
    (d.problems || []).forEach((p) => {
      topicMap[key].total += 1;
      if (p.completed) topicMap[key].done += 1;
    });
  });
  const categories = Object.values(topicMap).sort((a, b) => b.total - a.total);

  // Today's focus = first unsolved problem in the earliest incomplete day.
  let focus = null;
  for (const d of days) {
    const next = (d.problems || []).find((p) => !p.completed);
    if (next) { focus = { ...next, day: d.day_number, topic: d.topic }; break; }
  }

  const daysComplete = days.filter((d) => d.problems?.length && d.problems.every((p) => p.completed)).length;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            DSA Tracker
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            Mastery metrics and daily algorithms.
          </p>
        </div>

        {loading && <Spinner size="lg" className="mt-16" />}
        {error && <p className="text-sm mb-4" style={{ color: '#F87171' }}>{error}</p>}

        {!loading && (
          <div className="space-y-5">
            {/* ── Mastery + status ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
              <Card className="p-6">
                <Label>Global Mastery</Label>
                <div className="flex items-baseline gap-2.5 mt-4">
                  <span className="tnum text-[46px] font-bold leading-none grad-text">{solved}</span>
                  <span className="text-[17px] font-medium" style={{ color: 'var(--text-soft)' }}>/ {total} solved</span>
                </div>
                <div className="mt-6"><Bar value={solved} max={total || 1} height={7} /></div>
                <div className="flex items-center justify-between mt-3 mono text-[11px]" style={{ color: 'var(--muted)' }}>
                  <span>{pct.toFixed(0)}% completion</span>
                  <span>Level: {masteryLabel(pct)}</span>
                </div>
              </Card>

              <Card className="p-6">
                <Label>Problem Status</Label>
                <div className="mt-5 space-y-3.5">
                  {[
                    { k: 'Solved', v: solved, tone: '#4ADE80' },
                    { k: 'Unsolved', v: total - solved, tone: 'var(--muted)' },
                    { k: 'Days finished', v: `${daysComplete} / ${days.length}`, tone: 'var(--accent)' },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5 text-[13.5px]" style={{ color: 'var(--text-soft)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.tone }} />
                        {row.k}
                      </span>
                      <span className="mono text-[12px] tnum px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}>
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 flex gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
                  {byDifficulty.map((d) => (
                    <Chip key={d.diff} tone={DIFF_TONE[d.diff]}>{d.diff} {d.done}/{d.total}</Chip>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── Today's focus + categories ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
              <Card className="flex flex-col">
                <CardHead
                  title="Today's Focus"
                  subtitle="Next unsolved problem in your curriculum"
                  icon={IconFlame}
                  action={focus ? <Chip tone={DIFF_TONE[focus.difficulty]}>{focus.difficulty}</Chip> : null}
                />
                <div className="p-6 flex-1">
                  {focus ? (
                    <>
                      <div className="mono text-[11px]" style={{ color: 'var(--accent)' }}>
                        Day {focus.day} · {focus.topic}
                      </div>
                      <h3 className="text-[21px] font-bold mt-2 leading-snug" style={{ color: 'var(--text)' }}>
                        {focus.title}
                      </h3>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <GradButton onClick={() => toggle(focus.id)}>Mark as solved</GradButton>
                        <a
                          href={`https://leetcode.com/problemset/?search=${encodeURIComponent(focus.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mono text-[11.5px]"
                          style={{ color: 'var(--muted)' }}
                        >
                          Find on LeetCode ↗
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-[14px]" style={{ color: 'var(--text-soft)' }}>
                      {total ? 'Every problem is solved. The whole curriculum is done.' : 'No problems loaded.'}
                    </p>
                  )}
                </div>
              </Card>

              <Card className="flex flex-col">
                <CardHead title="Categories" icon={IconGrid} />
                <div className="p-5 space-y-3.5 flex-1 overflow-y-auto max-h-[360px]" data-lenis-prevent>
                  {categories.map((c) => (
                    <div key={c.topic}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] truncate pr-2" style={{ color: 'var(--text-soft)' }}>{c.topic}</span>
                        <span className="mono text-[11px] tnum shrink-0" style={{ color: 'var(--muted)' }}>{c.done}/{c.total}</span>
                      </div>
                      <Bar value={c.done} max={c.total} height={5} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── Day accordion ─────────────────────────────────────── */}
            <Card>
              <CardHead title="Curriculum" subtitle={`${days.length} days · ${total} problems`} />
              <div className="p-3 space-y-1.5">
                {days.map((day) => {
                  const isExpanded = expandedDays.has(day.day_number);
                  const dayDone = day.problems.filter((p) => p.completed).length;
                  const dayTotal = day.problems.length;
                  const allDone = dayDone === dayTotal && dayTotal > 0;

                  return (
                    <div key={day.day_number} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <button
                        onClick={() => toggleDay(day.day_number)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                        style={{ backgroundColor: isExpanded ? 'var(--surface-2)' : 'transparent' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="h-6 w-6 rounded-md flex items-center justify-center mono text-[11px] font-bold shrink-0"
                            style={
                              allDone
                                ? { backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }
                                : { backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }
                            }
                          >
                            {day.day_number}
                          </span>
                          <span className="text-[13.5px] font-medium truncate" style={{ color: 'var(--text)' }}>{day.topic}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="mono text-[11px] tnum" style={{ color: allDone ? 'var(--accent)' : 'var(--muted)' }}>
                            {dayDone}/{dayTotal}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ color: 'var(--muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <polyline points="2,4 6,8 10,4" />
                          </svg>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="problems"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ borderTop: '1px solid var(--border)' }}>
                              {day.problems.map((problem, i) => (
                                <div
                                  key={problem.id}
                                  onClick={() => toggle(problem.id)}
                                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                                  style={{ borderBottom: i < day.problems.length - 1 ? '1px solid var(--border)' : 'none' }}
                                >
                                  <span
                                    className="h-4 w-4 rounded flex items-center justify-center shrink-0"
                                    style={
                                      problem.completed
                                        ? { backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }
                                        : { border: '1px solid var(--border)' }
                                    }
                                  >
                                    {problem.completed && (
                                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="2,6 5,9 10,3" />
                                      </svg>
                                    )}
                                  </span>
                                  <span
                                    className="flex-1 text-[13px] truncate"
                                    style={{ color: problem.completed ? 'var(--muted)' : 'var(--text)', textDecoration: problem.completed ? 'line-through' : 'none' }}
                                  >
                                    {problem.title}
                                  </span>
                                  <Chip tone={DIFF_TONE[problem.difficulty]}>{problem.difficulty}</Chip>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </Page>
    </motion.div>
  );
}
