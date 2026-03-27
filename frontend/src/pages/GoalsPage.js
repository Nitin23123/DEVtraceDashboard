import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getGoals, createGoal, completeGoal, deleteGoal } from '../api/goals';
import Spinner from '../components/Spinner';

export default function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', target_date: '' });

  useEffect(() => {
    loadGoals();
  }, []);

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Goals</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + New Goal
        </button>
      </div>

      {loading && <Spinner size="lg" className="mt-12" />}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
      )}
      {!loading && goals.length === 0 && (
        <div className="text-center py-16 text-text/50">
          <p className="text-lg mb-1">No goals yet</p>
          <p className="text-sm">Set your first goal to get started.</p>
        </div>
      )}

      {goals.map(goal => (
        <div
          key={goal.id}
          className={`bg-surface border rounded-xl p-4 mb-3 flex items-start gap-3 ${goal.is_completed ? 'border-green-300 opacity-70' : 'border-border'}`}
        >
          <div className="flex-1 min-w-0">
            <strong className={`text-text font-semibold block ${goal.is_completed ? 'line-through opacity-50' : ''}`}>
              {goal.title}
            </strong>
            {goal.description && (
              <p className="text-text/70 text-sm mt-1">{goal.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {goal.is_completed ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
              ) : (
                <span className="text-xs text-text/40">Target: {goal.target_date || 'none'}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {!goal.is_completed && (
              <button
                onClick={() => handleComplete(goal.id)}
                className="text-xs px-2 py-1 rounded text-green-600 hover:bg-green-50 transition"
              >
                Complete
              </button>
            )}
            <button
              onClick={() => handleDelete(goal.id)}
              className="text-xs px-2 py-1 rounded text-red-400 hover:text-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-text mb-5">New Goal</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-text/80 mb-1">Title *</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-text/80 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-text/80 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={e => setFormData({...formData, target_date: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-border rounded-lg text-sm text-text/70 hover:text-text transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
