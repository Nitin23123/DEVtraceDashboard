import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useDisplayName } from '../context/DisplayNameContext';
import { getStats } from '../api/dashboard';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const listVariants = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.14 } },
};

// Shown when the live stats API is unreachable (e.g. local DB off) so the design still renders.
const SAMPLE = {
  tasks: { todo: 3, in_progress: 2, done: 8, total: 13 },
  notes: { total: 7 },
  goals: { total: 4, completed: 2 },
  streak: { current: 7, longest: 14 },
};

const MODAL_CONTENT = {
  tasks: (d) => ({ title: 'Tasks breakdown', items: [
    { label: 'To do', value: d.todo }, { label: 'In progress', value: d.in_progress },
    { label: 'Done', value: d.done }, { label: 'Total', value: d.total },
  ] }),
  notes: (d) => ({ title: 'Notes', items: [{ label: 'Total notes', value: d.total }] }),
  goals: (d) => ({ title: 'Goals progress', items: [
    { label: 'Total goals', value: d.total }, { label: 'Completed', value: d.completed },
    { label: 'Remaining', value: d.total - d.completed },
  ] }),
};

const STAT_CARDS = [
  { key: 'tasks', title: 'Tasks', value: (s) => s.tasks.total, subtitle: (s) => `${s.tasks.done} done · ${s.tasks.in_progress} active` },
  { key: 'notes', title: 'Notes', value: (s) => s.notes.total, subtitle: () => 'in your workspace' },
  { key: 'goals', title: 'Goals', value: (s) => s.goals.total, subtitle: (s) => `${s.goals.completed} completed` },
];

const QUICK = [
  { to: '/placements', label: 'Placements', desc: 'Interview prep' },
  { to: '/dsa', label: 'DSA Tracker', desc: '79 problems' },
  { to: '/pomodoro', label: 'Pomodoro', desc: 'Focus timer' },
  { to: '/workspace', label: 'Workspace', desc: 'Tasks · notes · goals' },
];

function greetingFor(date) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const { displayName, setDisplayName } = useDisplayName();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const saveName = () => { setDisplayName(draftName); setEditingName(false); };

  useEffect(() => { loadStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    setLoading(true);
    let data;
    try { data = await getStats(token); } catch { data = null; }
    if (data && data.tasks !== undefined) { setStats(data); setUsingSample(false); }
    else { setStats(SAMPLE); setUsingSample(true); }
    setLoading(false);
  };

  const now = new Date();
  const greeting = greetingFor(now);
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const emailPrefix = (user?.email || '').split('@')[0];
  const name = displayName || emailPrefix;
  const closeModal = () => setActiveModal(null);
  const modalData = activeModal && stats ? MODAL_CONTENT[activeModal](stats[activeModal]) : null;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Header / greeting */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
            {dateStr}
          </p>
          {editingName ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                placeholder="Your name"
                maxLength={40}
                className="px-3 py-2 rounded-lg text-2xl sm:text-3xl font-semibold tracking-tight focus:outline-none"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <button onClick={saveName} className="px-3 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>Save</button>
              <button onClick={() => setEditingName(false)} className="px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--muted)' }}>Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
                {greeting}{name ? <span style={{ color: 'var(--muted)' }}>, {name}</span> : null}.
              </h1>
              <button
                onClick={() => { setDraftName(displayName); setEditingName(true); }}
                title="Edit display name"
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </button>
            </div>
          )}
          <p className="mt-3 text-base" style={{ color: 'var(--text-soft)' }}>
            Here's where things stand. Keep the streak alive.
          </p>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}

        {!loading && stats && (
          <motion.div variants={listVariants} initial="initial" animate="animate">

            {/* Streak hero */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl border p-7 mb-5"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="absolute -right-10 -top-16 h-48 w-48 rounded-full"
                style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)' }}
              />
              <div className="relative flex items-center gap-5">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}
                >
                  🔥
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="tnum text-5xl font-semibold leading-none" style={{ color: 'var(--text)' }}>
                      {stats.streak.current}
                    </span>
                    <span className="text-lg font-medium" style={{ color: 'var(--text-soft)' }}>day streak</span>
                  </div>
                  <div className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                    Longest run · <span className="tnum">{stats.streak.longest}</span> days
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
              {STAT_CARDS.map((card) => (
                <motion.button
                  key={card.key}
                  variants={itemVariants}
                  onClick={() => setActiveModal(card.key)}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="group text-left rounded-2xl border p-6 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <div className="text-xs font-medium uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--muted)' }}>
                    {card.title}
                  </div>
                  <div className="tnum text-4xl font-semibold leading-none" style={{ color: 'var(--text)' }}>
                    {card.value(stats)}
                  </div>
                  <div className="text-xs mt-3" style={{ color: 'var(--text-soft)' }}>
                    {card.subtitle(stats)}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick launch */}
            <motion.div variants={itemVariants}>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--muted)' }}>
                Jump back in
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK.map((q) => (
                  <Link
                    key={q.to}
                    to={q.to}
                    className="rounded-xl border p-4 transition-colors group"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{q.label}</div>
                    <div className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                      {q.desc}
                      <span className="transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {usingSample && (
              <p className="text-xs mt-8" style={{ color: 'var(--muted)' }}>
                Showing sample figures — live stats need the database (local DB is off).
              </p>
            )}
          </motion.div>
        )}

        {/* Detail modal */}
        <AnimatePresence>
          {activeModal && modalData && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 60%, transparent)', backdropFilter: 'blur(4px)' }}
              onClick={closeModal}
            >
              <motion.div
                key="modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-sm rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>{modalData.title}</h2>
                {modalData.items.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-soft)' }}>{item.label}</span>
                    <span className="tnum text-xl font-semibold" style={{ color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
                <button
                  onClick={closeModal}
                  className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
