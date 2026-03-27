import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStats } from '../api/dashboard';

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
      style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        minWidth: '180px',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '40px', fontWeight: 'bold', color: color, lineHeight: 1 }}>{value}</div>
      {subtitle && <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>{subtitle}</div>}
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
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '32px', marginTop: 0 }}>Your productivity at a glance</p>

      {loading && <p>Loading stats...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {stats && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            backgroundColor: '#1e293b', color: 'white',
            borderRadius: '12px', padding: '20px 24px', marginBottom: '32px',
          }}>
            <span style={{ fontSize: '36px' }}>🔥</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>
                {stats.streak.current} day streak
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                Longest streak: {stats.streak.longest} days
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <StatCard title="Tasks" value={stats.tasks.total}
              subtitle={`${stats.tasks.done} done · ${stats.tasks.in_progress} in progress`}
              color="#3b82f6" onClick={() => setActiveModal('tasks')} />
            <StatCard title="Notes" value={stats.notes.total}
              subtitle="Click to view" color="#8b5cf6" onClick={() => setActiveModal('notes')} />
            <StatCard title="Goals" value={stats.goals.total}
              subtitle={`${stats.goals.completed} completed`}
              color="#10b981" onClick={() => setActiveModal('goals')} />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Click a card to see details</p>
        </>
      )}

      {activeModal && modalData && (
        <>
          <div onClick={closeModal} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white', borderRadius: '12px',
            padding: '32px', width: '360px', zIndex: 101,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{modalData.title}</h2>
            {modalData.items.map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid #f1f5f9',
              }}>
                <span style={{ color: '#475569' }}>{item.label}</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: item.color }}>{item.value}</span>
              </div>
            ))}
            <button onClick={closeModal} style={{
              marginTop: '20px', width: '100%', padding: '10px',
              backgroundColor: '#1e293b', color: 'white', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
            }}>Close</button>
          </div>
        </>
      )}
    </div>
  );
}
