import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const nextStatus = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

const statusClass = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

const priorityClass = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const listVariants = { animate: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

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
    if (data.tasks) {
      const sorted = data.tasks.sort((a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        new Date(b.created_at) - new Date(a.created_at)
      );
      setTasks(sorted);
    } else {
      setError('Failed to load tasks');
    }
    setLoading(false);
  };

  const togglePin = async (taskId) => {
    const res = await fetch(`${API_URL}/api/tasks/${taskId}/pin`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    const updated = await res.json();
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? updated : t);
      return next.sort((a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        new Date(b.created_at) - new Date(a.created_at)
      );
    });
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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Tasks</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + New Task
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-12" />}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-16 text-text/50">
            <p className="text-lg mb-1">No tasks yet</p>
            <p className="text-sm">Create your first task to get started.</p>
          </div>
        )}

        <motion.div variants={listVariants} initial="initial" animate="animate">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              variants={itemVariants}
              className="bg-surface border border-border rounded-xl p-4 mb-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start gap-2">
                <strong className="text-text font-semibold flex-1">{task.title}</strong>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePin(task.id)}
                    title={task.pinned ? 'Unpin' : 'Pin task'}
                    className={`text-lg transition-opacity ${task.pinned ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => cycleStatus(task)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass[task.status] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {task.status}
                  </button>
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-xs px-2 py-1 rounded text-text/60 hover:text-text hover:bg-border/40 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs px-2 py-1 rounded text-red-400 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {task.description && <p className="text-text/70 text-sm mt-1">{task.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityClass[task.priority] || 'bg-slate-100 text-slate-600'}`}>
                  {task.priority}
                </span>
                {task.due_date && (
                  <span className="text-xs text-text/40">Due: {task.due_date}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {(showCreateModal || editTask) && (
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                key="modal-card"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-text mb-5">{editTask ? 'Edit Task' : 'New Task'}</h2>
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
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-text/80 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-text/80 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={e => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {editTask ? 'Save Changes' : 'Create Task'}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
