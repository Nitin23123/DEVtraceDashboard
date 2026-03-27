import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

const nextStatus = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasks(token);
    if (data.tasks) setTasks(data.tasks);
    else setError('Failed to load tasks');
    setLoading(false);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditTask(null);
    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editTask) {
      await updateTask(token, editTask.id, formData);
    } else {
      await createTask(token, formData);
    }
    closeModal();
    loadTasks();
  };

  const cycleStatus = async (task) => {
    await updateTask(token, task.id, { status: nextStatus[task.status] });
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(token, id);
      loadTasks();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tasks</h1>
      <button onClick={() => setShowCreateModal(true)}>+ New Task</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && tasks.length === 0 && <p>No tasks yet. Create your first task!</p>}

      {tasks.map(task => (
        <div key={task.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '12px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{task.title}</strong>
            <div>
              <button onClick={() => cycleStatus(task)}>{task.status}</button>
              <button onClick={() => openEditModal(task)}>Edit</button>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </div>
          </div>
          {task.description && <p>{task.description}</p>}
          <small>Priority: {task.priority} | Due: {task.due_date || 'none'}</small>
        </div>
      ))}

      {(showCreateModal || editTask) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
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
                <label>Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label>Due Date</label>
                <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <div>
                <button type="submit">{editTask ? 'Save Changes' : 'Create Task'}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
