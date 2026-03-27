import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const TOTAL_PROBLEMS = 79;

const DIFFICULTY_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export default function DsaPage() {
  const { token } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Set());

  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchProblems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProblems() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dsa/problems`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDays(data);
      else setError(data.error || 'Failed to load DSA problems');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
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
    } catch {
      setError('Failed to update progress');
    }
  }

  function toggleDay(dayNumber) {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNumber)) next.delete(dayNumber);
      else next.add(dayNumber);
      return next;
    });
  }

  const completed = days.flatMap(d => d.problems).filter(p => p.completed).length;
  const progressPercent = TOTAL_PROBLEMS > 0 ? (completed / TOTAL_PROBLEMS) * 100 : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-1">DSA Sheet Tracker</h1>
      <p className="text-sm text-text/60 mb-6">
        Track your progress through the 79-problem DSA curriculum.
      </p>

      {/* Progress card */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm text-text">Overall Progress</span>
          <span className="font-bold text-lg text-accent">{completed}/{TOTAL_PROBLEMS}</span>
        </div>
        <div className="bg-border rounded-full h-3 w-full mt-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, background: 'var(--accent)' }}
          />
        </div>
        <div className="text-xs text-text/50 mt-2">{progressPercent.toFixed(1)}% complete</div>
      </div>

      {loading && <Spinner size="lg" className="mt-12" />}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Accordion days */}
      {days.map(day => {
        const isExpanded = expandedDays.has(day.day_number);
        const dayCompleted = day.problems.filter(p => p.completed).length;
        const dayTotal = day.problems.length;
        const allDone = dayCompleted === dayTotal && dayTotal > 0;

        return (
          <div key={day.day_number} className="bg-surface border border-border rounded-xl mb-2 overflow-hidden">
            {/* Day header */}
            <button
              onClick={() => toggleDay(day.day_number)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg/50 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: allDone ? '#10b981' : 'var(--border)',
                    color: allDone ? 'white' : 'var(--text)',
                  }}
                >
                  {allDone ? '✓' : day.day_number}
                </span>
                <span className="font-semibold text-sm text-text">
                  Day {day.day_number} — {day.topic}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${allDone ? 'text-emerald-500' : 'text-text/50'}`}>
                  {dayCompleted}/{dayTotal}
                </span>
                <span className="text-text/30 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Problems list */}
            {isExpanded && (
              <div className="border-t border-border">
                {day.problems.map(problem => (
                  <div
                    key={problem.id}
                    onClick={() => toggleProblem(problem.id)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-bg/60 transition"
                  >
                    <input
                      type="checkbox"
                      checked={problem.completed}
                      onChange={() => toggleProblem(problem.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 cursor-pointer accent-accent"
                    />
                    <span className={`flex-1 text-sm text-text ${problem.completed ? 'line-through opacity-50' : ''}`}>
                      {problem.title}
                    </span>
                    {/* Difficulty badge — data-driven hex colors preserved */}
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        color: DIFFICULTY_COLORS[problem.difficulty] || '#94a3b8',
                        background: `${DIFFICULTY_COLORS[problem.difficulty] || '#94a3b8'}18`,
                      }}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
