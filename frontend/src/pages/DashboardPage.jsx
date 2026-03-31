import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getStats } from '../api/dashboard';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const listVariants = { animate: { transition: { staggerChildren: 0.07 } } };
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.14 } },
};

const MODAL_CONTENT = {
  tasks: (data) => ({
    title: 'Tasks Breakdown',
    items: [
      { label: 'To Do',       value: data.todo },
      { label: 'In Progress', value: data.in_progress },
      { label: 'Done',        value: data.done },
      { label: 'Total',       value: data.total },
    ],
  }),
  notes: (data) => ({
    title: 'Notes',
    items: [{ label: 'Total Notes', value: data.total }],
  }),
  goals: (data) => ({
    title: 'Goals Progress',
    items: [
      { label: 'Total Goals', value: data.total },
      { label: 'Completed',   value: data.completed },
      { label: 'Remaining',   value: data.total - data.completed },
    ],
  }),
};

const STAT_CARDS = [
  { key: 'tasks', title: 'Tasks',  subtitle: (s) => `${s.tasks.done} done · ${s.tasks.in_progress} active`, value: (s) => s.tasks.total },
  { key: 'notes', title: 'Notes',  subtitle: () => 'Click to view',                                         value: (s) => s.notes.total },
  { key: 'goals', title: 'Goals',  subtitle: (s) => `${s.goals.completed} completed`,                       value: (s) => s.goals.total },
];

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStats(token);
    if (data.tasks !== undefined) setStats(data);
    else setError('Failed to load dashboard stats');
    setLoading(false);
  };

  const closeModal = () => setActiveModal(null);
  const modalData = activeModal && stats ? MODAL_CONTENT[activeModal](stats[activeModal]) : null;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Your productivity at a glance</p>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {stats && (
          <>
            {/* Streak */}
            <div
              className="rounded-xl border p-6 mb-8 flex items-center gap-5"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                🔥
              </div>
              <div>
                <div className="text-3xl font-bold text-white leading-none">
                  {stats.streak.current} <span className="text-lg font-medium" style={{ color: 'var(--muted)' }}>day streak</span>
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  Longest: {stats.streak.longest} days
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              variants={listVariants}
              initial="initial"
              animate="animate"
            >
              {STAT_CARDS.map(card => (
                <motion.div
                  key={card.key}
                  variants={itemVariants}
                  onClick={() => setActiveModal(card.key)}
                  className="rounded-xl border p-6 cursor-pointer transition-colors hover:border-white/20 group"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                    {card.title}
                  </div>
                  <div className="text-4xl font-bold text-white leading-none">
                    {card.value(stats)}
                  </div>
                  <div className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
                    {card.subtitle(stats)}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>Click a card to see details</p>
          </>
        )}

        {/* Modal */}
        <AnimatePresence>
          {activeModal && modalData && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              onClick={closeModal}
            >
              <motion.div
                key="modal"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full max-w-sm rounded-xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">{modalData.title}</h2>
                {modalData.items.map(item => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>{item.label}</span>
                    <span className="text-xl font-bold text-white">{item.value}</span>
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
