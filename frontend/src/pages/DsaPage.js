import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    <div style={{ padding: '24px', maxWidth: '860px', color: 'var(--text)' }}>
      <h1 style={{ marginBottom: '8px', color: 'var(--text)' }}>DSA Sheet Tracker</h1>
      <p style={{ color: 'var(--text)', opacity: 0.6, marginBottom: '24px', fontSize: '14px' }}>
        Track your progress through the 79-problem DSA curriculum.
      </p>

      {/* Progress section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>Overall Progress</span>
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--accent)' }}>
            {completed}/{TOTAL_PROBLEMS}
          </span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 8, height: 12, width: '100%' }}>
          <div style={{
            background: 'var(--accent)',
            borderRadius: 8,
            height: 12,
            width: `${progressPercent}%`,
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text)', opacity: 0.6 }}>
          {progressPercent.toFixed(1)}% complete
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text)', opacity: 0.6 }}>Loading problems...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {/* Accordion days */}
      {days.map(day => {
        const isExpanded = expandedDays.has(day.day_number);
        const dayCompleted = day.problems.filter(p => p.completed).length;
        const dayTotal = day.problems.length;
        const allDone = dayCompleted === dayTotal && dayTotal > 0;

        return (
          <div
            key={day.day_number}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              marginBottom: '8px',
              overflow: 'hidden'
            }}
          >
            {/* Day header */}
            <button
              onClick={() => toggleDay(day.day_number)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: allDone ? '#10b981' : 'var(--border)',
                  color: allDone ? 'white' : 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {allDone ? '✓' : day.day_number}
                </span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  Day {day.day_number} — {day.topic}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  color: allDone ? '#10b981' : 'var(--text)',
                  opacity: allDone ? 1 : 0.6,
                  fontWeight: allDone ? 700 : 400
                }}>
                  {dayCompleted}/{dayTotal}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.5 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {/* Problems list */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
                {day.problems.map(problem => (
                  <div
                    key={problem.id}
                    onClick={() => toggleProblem(problem.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: problem.completed ? '#10b98108' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = problem.completed ? '#10b98108' : 'transparent'}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={problem.completed}
                      onChange={() => toggleProblem(problem.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                    />
                    {/* Title */}
                    <span style={{
                      flex: 1,
                      fontSize: '14px',
                      color: 'var(--text)',
                      textDecoration: problem.completed ? 'line-through' : 'none',
                      opacity: problem.completed ? 0.6 : 1
                    }}>
                      {problem.title}
                    </span>
                    {/* Difficulty badge */}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: DIFFICULTY_COLORS[problem.difficulty] || '#94a3b8',
                      background: `${DIFFICULTY_COLORS[problem.difficulty] || '#94a3b8'}18`,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
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
