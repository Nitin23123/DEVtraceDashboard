import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStats } from '../api/dashboard';
import Spinner from '../components/Spinner';

const MODAL_CONTENT = {
  tasks: (data) => ({
    title: 'Tasks Breakdown',
    items: [
      { label: 'To Do', value: data.todo, color: '#f59e0b' },
      { label: 'In Progress', value: data.in_progress, color: '#3b82f6' },
      { label: 'Done', value: data.done, color: '#10b981' },
      { label: 'Total', value: data.total, color: '#1e293b' },
    ],
  }),
  notes: (data) => ({
    title: 'Notes',
    items: [{ label: 'Total Notes', value: data.total, color: '#8b5cf6' }],
  }),
  goals: (data) => ({
    title: 'Goals Progress',
    items: [
      { label: 'Total Goals', value: data.total, color: '#1e293b' },
      { label: 'Completed', value: data.completed, color: '#10b981' },
      { label: 'Remaining', value: data.total - data.completed, color: '#f59e0b' },
    ],
  }),
};

function StatCard({ title, value, subtitle, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow flex-1 min-w-[160px]"
    >
      <div className="text-sm text-text/60 mb-2 font-medium">{title}</div>
      <div className="text-4xl font-bold leading-none" style={{ color }}>{value}</div>
      {subtitle && <div className="text-xs text-text/40 mt-2">{subtitle}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStats(token);
    if (data.tasks !== undefined) {
      setStats(data);
    } else {
      setError('Failed to load dashboard stats');
    }
    setLoading(false);
  };

  const closeModal = () => setActiveModal(null);
  const modalData = activeModal && stats ? MODAL_CONTENT[activeModal](stats[activeModal]) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-text mb-1">Dashboard</h1>
      <p className="text-sm text-text/60 mb-8">Your productivity at a glance</p>

      {loading && <Spinner size="lg" className="mt-16" />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {stats && (
        <>
          <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center gap-4 mb-6">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-3xl font-bold leading-none">
                {stats.streak.current} day streak
              </div>
              <div className="text-sm text-slate-400 mt-1">
                Longest streak: {stats.streak.longest} days
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap mb-4">
            <StatCard title="Tasks" value={stats.tasks.total}
              subtitle={`${stats.tasks.done} done · ${stats.tasks.in_progress} in progress`}
              color="#3b82f6" onClick={() => setActiveModal('tasks')} />
            <StatCard title="Notes" value={stats.notes.total}
              subtitle="Click to view" color="#8b5cf6" onClick={() => setActiveModal('notes')} />
            <StatCard title="Goals" value={stats.goals.total}
              subtitle={`${stats.goals.completed} completed`}
              color="#10b981" onClick={() => setActiveModal('goals')} />
          </div>
          <p className="text-xs text-text/40">Click a card to see details</p>
        </>
      )}

      {activeModal && modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-text mb-5">{modalData.title}</h2>
            {modalData.items.map(item => (
              <div key={item.label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <span className="text-text/60">{item.label}</span>
                <span className="font-bold text-xl" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
            <button
              onClick={closeModal}
              className="mt-5 w-full py-2.5 bg-accent text-accent-fg rounded-lg font-medium hover:opacity-80 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
