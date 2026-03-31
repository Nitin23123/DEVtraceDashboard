import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const nextStatus = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

const statusStyle = {
  todo:        { color: '#888888', label: 'Todo' },
  in_progress: { color: '#f59e0b', label: 'In Progress' },
  done:        { color: '#22c55e', label: 'Done' },
};

const priorityStyle = {
  high:   { color: '#ef4444' },
  medium: { color: '#f59e0b' },
  low:    { color: '#888888' },
};

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.14 } },
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasks(token);
    if (data.tasks) {
      setTasks(data.tasks.sort((a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at)
      ));
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
    setTasks(prev =>
      prev.map(t => t.id === taskId ? updated : t)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at))
    );
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditTask(null);
    setFormData({ title: '', description: '', priority: 'medium', due_date: '' });
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editTask) await updateTask(token, editTask.id, formData);
    else await createTask(token, formData);
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
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Tasks</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{tasks.length} total</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + New Task
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-base mb-1">No tasks yet</p>
            <p className="text-sm">Create your first task to get started.</p>
          </div>
        )}

        {/* Task list */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {tasks.map((task, i) => (
            <div
              key={task.id}
              className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}
            >
              {/* Pin dot */}
              <button
                onClick={() => togglePin(task.id)}
                className="mt-0.5 shrink-0 transition-opacity"
                style={{ opacity: task.pinned ? 1 : 0.2 }}
                title={task.pinned ? 'Unpin' : 'Pin'}
              >
                <div className="h-2 w-2 rounded-full bg-white mt-1.5" />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm text-white ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                  </span>
                  {task.pinned && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}>
                      pinned
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs mt-1 truncate" style={{ color: 'var(--muted)' }}>{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => cycleStatus(task)}
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: statusStyle[task.status]?.color || '#888' }}
                  >
                    {statusStyle[task.status]?.label || task.status}
                  </button>
                  <span className="text-xs" style={{ color: priorityStyle[task.priority]?.color || '#888' }}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>Due {task.due_date}</span>
                  )}
                </div>
              </div>

              {/* Actions — visible on hover */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(task)}
                  className="px-2.5 py-1 text-xs rounded-md transition-colors"
                  style={{ color: 'var(--muted)', backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2.5 py-1 text-xs rounded-md text-red-500 transition-colors hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {(showCreateModal || editTask) && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={closeModal}
            >
              <motion.div
                key="modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-md rounded-xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">{editTask ? 'Edit Task' : 'New Task'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={inputClass} style={inputStyle} placeholder="Task title" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className={inputClass} style={{ ...inputStyle, resize: 'none' }} placeholder="Optional description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className={inputClass} style={inputStyle}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white">Due Date</label>
                      <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      {editTask ? 'Save Changes' : 'Create Task'}
                    </button>
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
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
