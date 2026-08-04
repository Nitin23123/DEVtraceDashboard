import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useDisplayName } from '../context/DisplayNameContext';
import { getStats } from '../api/dashboard';
import { getProblems } from '../api/dsa';
import { getCalendar } from '../api/placements';
import Spinner from '../components/Spinner';
import { Card, CardHead, Label, Bar, Chip, GhostButton, Page } from '../components/ui';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
const listVariants = { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// Rendered when the stats API is unreachable (e.g. local DB off) so the layout still reads.
const SAMPLE_STATS = {
  tasks: { todo: 3, in_progress: 2, done: 8, total: 13 },
  notes: { total: 7 },
  goals: { total: 4, completed: 2 },
  streak: { current: 7, longest: 14 },
};

const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const IconChart = <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 15v-3M12 15V9M17 15v-5" /></>} />;
const IconTarget = <Icon d={<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>} />;
const IconCheck = <Icon d={<><circle cx="12" cy="12" r="9" /><polyline points="8.5 12.5 11 15 16 9.5" /></>} />;
const IconClock = <Icon d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} size={15} />;
const IconCal = <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />;

function greetingFor(date) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Big number + unit, as used across the three summary cards. */
function StatCard({ label, icon, value, unit, children }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-5 h-full">
        <div className="flex items-start justify-between">
          <Label>{label}</Label>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-2 mt-5">
          <span className="tnum text-[38px] font-bold leading-none grad-text">{value}</span>
          {unit && <span className="text-[15px] font-medium" style={{ color: 'var(--text-soft)' }}>{unit}</span>}
        </div>
        <div className="mt-4">{children}</div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { displayName, setDisplayName } = useDisplayName();

  const [stats, setStats] = useState(null);
  const [dsaDays, setDsaDays] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);
  const [topicRange, setTopicRange] = useState('all');

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const saveName = () => { setDisplayName(draftName); setEditingName(false); };

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAll() {
    setLoading(true);
    const [s, d, c] = await Promise.all([
      getStats(token).catch(() => null),
      getProblems(token).catch(() => null),
      getCalendar(token).catch(() => null),
    ]);

    if (s && s.tasks !== undefined) { setStats(s); setUsingSample(false); }
    else { setStats(SAMPLE_STATS); setUsingSample(true); }

    setDsaDays(Array.isArray(d) ? d : []);
    setCalendar(Array.isArray(c) ? c : []);
    setLoading(false);
  }

  const now = new Date();
  const name = displayName || (user?.email || '').split('@')[0];

  // ── Derived DSA figures ───────────────────────────────────────────────────
  const allProblems = dsaDays.flatMap((d) => d.problems || []);
  const solved = allProblems.filter((p) => p.completed).length;
  const totalProblems = allProblems.length;

  // Topic distribution — solved vs total per topic, biggest topics first.
  const topicMap = {};
  dsaDays.forEach((d) => {
    const key = d.topic || 'Other';
    if (!topicMap[key]) topicMap[key] = { topic: key, total: 0, done: 0 };
    (d.problems || []).forEach((p) => {
      topicMap[key].total += 1;
      if (p.completed) topicMap[key].done += 1;
    });
  });
  let topics = Object.values(topicMap).sort((a, b) => b.total - a.total);
  if (topicRange === 'active') topics = topics.filter((t) => t.done > 0);
  topics = topics.slice(0, 8);

  const pendingTasks = stats ? stats.tasks.todo + stats.tasks.in_progress : 0;
  const nextDrives = calendar.slice(0, 2);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div className="mb-9">
          {editingName ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                placeholder="Your name"
                maxLength={40}
                className="px-3 py-2 rounded-lg text-2xl sm:text-3xl font-bold tracking-tight focus:outline-none"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <button onClick={saveName} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundImage: 'var(--grad)', color: 'var(--accent-fg)' }}>Save</button>
              <button onClick={() => setEditingName(false)} className="px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--muted)' }}>Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[34px] sm:text-[42px] font-bold tracking-tight leading-none" style={{ color: 'var(--text)' }}>
                {greetingFor(now)}{name ? `, ${name}` : ''}.
              </h1>
              <button
                onClick={() => { setDraftName(displayName); setEditingName(true); }}
                title="Edit display name"
                className="p-1.5 rounded-md"
                style={{ color: 'var(--muted)' }}
              >
                <Icon d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>} size={17} />
              </button>
            </div>
          )}

          {stats && (
            <p className="mt-3 flex items-center gap-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
              <span style={{ color: 'var(--accent)' }}>{IconClock}</span>
              {stats.streak.current > 1
                ? `You're on a ${stats.streak.current}-day streak. Keep pushing.`
                : 'A new streak starts today. Keep pushing.'}
            </p>
          )}
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}

        {!loading && stats && (
          <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-5">

            {/* ── Summary cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard label="DSA Progress" icon={IconChart} value={solved} unit={totalProblems ? `/ ${totalProblems}` : ''}>
                <Bar value={solved} max={totalProblems || 1} />
                <div className="mono text-[10.5px] mt-2" style={{ color: 'var(--muted)' }}>
                  {totalProblems ? `${Math.round((solved / totalProblems) * 100)}% complete` : 'connect to load'}
                </div>
              </StatCard>

              <StatCard label="Goals" icon={IconTarget} value={stats.goals.completed} unit={`/ ${stats.goals.total} done`}>
                <div className="flex flex-wrap gap-1.5">
                  <Chip>{stats.goals.total - stats.goals.completed} open</Chip>
                  <Chip>{stats.notes.total} notes</Chip>
                </div>
              </StatCard>

              <StatCard label="Tasks" icon={IconCheck} value={pendingTasks} unit="pending">
                <div className="flex flex-wrap gap-1.5">
                  <Chip tone={{ bg: 'rgba(240,160,140,0.13)', fg: '#F0A08C' }}>{stats.tasks.todo} to do</Chip>
                  <Chip tone={{ bg: 'rgba(165,180,252,0.13)', fg: '#A5B4FC' }}>{stats.tasks.in_progress} active</Chip>
                  <Chip>{stats.tasks.done} done</Chip>
                </div>
              </StatCard>
            </div>

            {/* ── Drives + topic distribution ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-5">
              {/* Upcoming campus drives */}
              <motion.div variants={itemVariants}>
                <Card className="h-full flex flex-col">
                  <CardHead
                    title="Upcoming Drives"
                    subtitle="From the GGSIPU campus calendar"
                    icon={IconCal}
                    action={
                      <Link to="/placements" className="mono text-[11px] shrink-0" style={{ color: 'var(--accent)' }}>
                        View all
                      </Link>
                    }
                  />
                  <div className="p-5 space-y-4 flex-1">
                    {nextDrives.length === 0 && (
                      <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                        No drives loaded — the placements API is unreachable.
                      </p>
                    )}
                    {nextDrives.map((m) => (
                      <div key={m.month}>
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{m.month}</span>
                          <Chip>{m.companies.length} companies</Chip>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.companies.slice(0, 6).map((c) => (
                            <Chip key={c.slug}>{c.name}</Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* DSA topic distribution */}
              <motion.div variants={itemVariants}>
                <Card className="h-full flex flex-col">
                  <CardHead
                    title="DSA Topic Distribution"
                    subtitle={`${topics.length} topics · ${solved}/${totalProblems || 0} solved`}
                    action={
                      <div className="flex gap-1.5 shrink-0">
                        <GhostButton active={topicRange === 'active'} onClick={() => setTopicRange('active')}>Started</GhostButton>
                        <GhostButton active={topicRange === 'all'} onClick={() => setTopicRange('all')}>All Time</GhostButton>
                      </div>
                    }
                  />
                  <div className="p-5 flex-1">
                    {topics.length === 0 ? (
                      <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                        {totalProblems ? 'Nothing started yet — solve a problem to populate this.' : 'DSA data unavailable.'}
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {topics.map((t) => (
                          <div key={t.topic}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[13px]" style={{ color: 'var(--text-soft)' }}>{t.topic}</span>
                              <span className="mono text-[11px] tnum" style={{ color: 'var(--muted)' }}>{t.done}/{t.total}</span>
                            </div>
                            <Bar value={t.done} max={t.total} height={5} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {usingSample && (
              <p className="mono text-[11px] pt-2" style={{ color: 'var(--muted)' }}>
                Showing sample figures — live stats need the database.
              </p>
            )}
          </motion.div>
        )}
      </Page>
    </motion.div>
  );
}
