import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getGoals, createGoal, completeGoal, deleteGoal } from '../api/goals';

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
    <div style={{ padding: '20px' }}>
      <h1>Goals</h1>
      <button onClick={() => setShowCreateModal(true)}>+ New Goal</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && goals.length === 0 && <p>No goals yet. Set your first goal!</p>}

      {goals.map(goal => (
        <div key={goal.id} style={{
          border: `1px solid ${goal.is_completed ? '#4caf50' : '#ccc'}`,
          margin: '8px 0',
          padding: '12px',
          borderRadius: '4px',
          opacity: goal.is_completed ? 0.7 : 1
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ textDecoration: goal.is_completed ? 'line-through' : 'none' }}>
              {goal.title}
            </strong>
            <div>
              {!goal.is_completed && (
                <button onClick={() => handleComplete(goal.id)}>Complete</button>
              )}
              <button onClick={() => handleDelete(goal.id)}>Delete</button>
            </div>
          </div>
          {goal.description && <p>{goal.description}</p>}
          <small>
            {goal.is_completed ? 'Completed' : `Target: ${goal.target_date || 'none'}`}
          </small>
        </div>
      ))}

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h2>New Goal</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Title *</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label>Target Date</label>
                <input type="date" value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})} />
              </div>
              <div>
                <button type="submit">Create Goal</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
