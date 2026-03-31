import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TOTAL_PROBLEMS = 79;

const DIFFICULTY_COLOR = {
  Easy:   '#22c55e',
  Medium: '#f59e0b',
  Hard:   '#ef4444',
};

export default function DsaPage() {
  const { token } = useAuth();
  const [days, setDays]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expandedDays, setExpandedDays] = useState(new Set());

  const authToken = token || localStorage.getItem('token');

  useEffect(() => { fetchProblems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProblems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dsa/problems`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (Array.isArray(data)) setDays(data);
      else setError(data.error || 'Failed to load DSA problems');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  async function toggleProblem(problemId) {
    try {
      const res = await fetch(`${API_URL}/api/dsa/progress/${problemId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const { completed } = await res.json();
      setDays(prev => prev.map(day => ({
        ...day,
        problems: day.problems.map(p => p.id === problemId ? { ...p, completed } : p)
      })));
    } catch { setError('Failed to update progress'); }
  }

  function toggleDay(dayNumber) {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNumber)) next.delete(dayNumber); else next.add(dayNumber);
      return next;
    });
  }

  const completed = days.flatMap(d => d.problems).filter(p => p.completed).length;
  const progressPercent = TOTAL_PROBLEMS > 0 ? (completed / TOTAL_PROBLEMS) * 100 : 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">DSA Tracker</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>79-problem curriculum</p>
        </div>

        {/* Progress */}
        <div className="rounded-xl border p-5 mb-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Overall Progress</span>
            <span className="text-sm font-bold text-white">{completed} / {TOTAL_PROBLEMS}</span>
          </div>
          <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: 'white' }}
            />
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{progressPercent.toFixed(1)}% complete</div>
        </div>

        {loading && <Spinner size="lg" className="mt-12" />}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Day accordion */}
        <div className="space-y-2">
          {days.map(day => {
            const isExpanded = expandedDays.has(day.day_number);
            const dayCompleted = day.problems.filter(p => p.completed).length;
            const dayTotal = day.problems.length;
            const allDone = dayCompleted === dayTotal && dayTotal > 0;

            return (
              <div key={day.day_number} className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: allDone ? '#22c55e40' : 'var(--border)' }}>
                {/* Header */}
                <button
                  onClick={() => toggleDay(day.day_number)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: allDone ? '#22c55e' : 'var(--surface-2)', color: allDone ? 'black' : 'var(--muted)' }}
                    >
                      {allDone ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="black" strokeWidth="2.5">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      ) : day.day_number}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">Day {day.day_number}</span>
                      <span className="text-sm ml-2" style={{ color: 'var(--muted)' }}>— {day.topic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: allDone ? '#22c55e' : 'var(--muted)' }}>
                      {dayCompleted}/{dayTotal}
                    </span>
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: 'var(--muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <polyline points="2,4 6,8 10,4" />
                    </svg>
                  </div>
                </button>

                {/* Problems */}
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
                            onClick={() => toggleProblem(problem.id)}
                            className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                            style={{ borderBottom: i < day.problems.length - 1 ? '1px solid var(--border)' : 'none' }}
                          >
                            {/* Checkbox */}
                            <div
                              className="h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                              style={{
                                borderColor: problem.completed ? '#22c55e' : 'var(--border)',
                                backgroundColor: problem.completed ? '#22c55e20' : 'transparent',
                              }}
                            >
                              {problem.completed && (
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                  <polyline points="2,6 5,9 10,3" />
                                </svg>
                              )}
                            </div>
                            <span className={`flex-1 text-sm ${problem.completed ? 'line-through' : 'text-white'}`}
                              style={{ color: problem.completed ? 'var(--muted)' : 'white' }}>
                              {problem.title}
                            </span>
                            <span className="text-xs font-medium shrink-0" style={{ color: DIFFICULTY_COLOR[problem.difficulty] || '#888' }}>
                              {problem.difficulty}
                            </span>
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
      </div>
    </motion.div>
  );
}
