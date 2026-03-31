import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getGoals, createGoal, completeGoal, deleteGoal } from '../api/goals';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

export default function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', target_date: '' });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    const data = await getGoals(token);
    if (data.goals) setGoals(data.goals);
    else setError('Failed to load goals');
    setLoading(false);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setFormData({ title: '', description: '', target_date: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createGoal(token, formData);
    closeModal();
    loadGoals();
  };

  const handleComplete = async (id) => {
    await completeGoal(token, id);
    loadGoals();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      await deleteGoal(token, id);
      loadGoals();
    }
  };

  const completed = goals.filter(g => g.is_completed).length;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Goals</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {completed}/{goals.length} completed
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + New Goal
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!loading && goals.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-base mb-1">No goals yet</p>
            <p className="text-sm">Set your first goal to get started.</p>
          </div>
        )}

        {/* Goals list */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {goals.map((goal, i) => (
            <div
              key={goal.id}
              className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{
                borderBottom: i < goals.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--surface)',
                opacity: goal.is_completed ? 0.6 : 1,
              }}
            >
              {/* Complete toggle */}
              <button
                onClick={() => !goal.is_completed && handleComplete(goal.id)}
                className="mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors"
                style={{
                  borderColor: goal.is_completed ? '#22c55e' : 'var(--border)',
                  backgroundColor: goal.is_completed ? '#22c55e22' : 'transparent',
                }}
                title={goal.is_completed ? 'Completed' : 'Mark complete'}
              >
                {goal.is_completed && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm text-white ${goal.is_completed ? 'line-through' : ''}`}>
                  {goal.title}
                </p>
                {goal.description && (
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{goal.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {goal.is_completed ? (
                    <span className="text-xs" style={{ color: '#22c55e' }}>Completed</span>
                  ) : (
                    goal.target_date && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>Target: {goal.target_date}</span>
                    )
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!goal.is_completed && (
                  <button
                    onClick={() => handleComplete(goal.id)}
                    className="px-2.5 py-1 text-xs rounded-md transition-colors"
                    style={{ color: '#22c55e' }}
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="px-2.5 py-1 text-xs rounded-md text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={closeModal}
          >
            <div
              className="w-full max-w-md rounded-xl border p-6"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-5">New Goal</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Title</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Goal title"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Optional description"
                    className={inputClass}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Target Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                    Create Goal
                  </button>
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
