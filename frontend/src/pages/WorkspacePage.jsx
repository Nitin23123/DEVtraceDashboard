import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { getGoals, createGoal, completeGoal, deleteGoal } from '../api/goals';
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

const tabContentVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

const tabs = [
  { id: 'tasks', label: 'Tasks', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )},
  { id: 'notes', label: 'Notes', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { id: 'goals', label: 'Goals', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )},
];

export default function WorkspacePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteError, setNoteError] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  // Goals state
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalError, setGoalError] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', target_date: '' });

  // Load all data on mount
  useEffect(() => { loadTasks(); loadNotes(); loadGoals(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Tasks ---
  const loadTasks = async () => {
    setTasksLoading(true);
    const data = await getTasks(token);
    if (data.tasks) {
      setTasks(data.tasks.sort((a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at)
      ));
    } else setTaskError('Failed to load tasks');
    setTasksLoading(false);
  };

  const togglePin = async (taskId) => {
    const res = await fetch(`${API_URL}/api/tasks/${taskId}/pin`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
    const updated = await res.json();
    setTasks(prev =>
      prev.map(t => t.id === taskId ? updated : t)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at))
    );
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date || '' });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (editTask) await updateTask(token, editTask.id, taskForm);
    else await createTask(token, taskForm);
    closeTaskModal();
    loadTasks();
  };

  const cycleStatus = async (task) => {
    await updateTask(token, task.id, { status: nextStatus[task.status] });
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) { await deleteTask(token, id); loadTasks(); }
  };

  // --- Notes ---
  const loadNotes = async () => {
    setNotesLoading(true);
    const data = await getNotes(token);
    if (data.notes) setNotes(data.notes);
    else setNoteError('Failed to load notes');
    setNotesLoading(false);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setEditNote(null);
    setNoteForm({ title: '', content: '' });
  };

  const openEditNote = (note) => {
    setEditNote(note);
    setNoteForm({ title: note.title, content: note.content || '' });
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (editNote) await updateNote(token, editNote.id, noteForm);
    else await createNote(token, noteForm);
    closeNoteModal();
    loadNotes();
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this note?')) { await deleteNote(token, id); loadNotes(); }
  };

  // --- Goals ---
  const loadGoals = async () => {
    setGoalsLoading(true);
    const data = await getGoals(token);
    if (data.goals) setGoals(data.goals);
    else setGoalError('Failed to load goals');
    setGoalsLoading(false);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setGoalForm({ title: '', description: '', target_date: '' });
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    await createGoal(token, goalForm);
    closeGoalModal();
    loadGoals();
  };

  const handleCompleteGoal = async (id) => { await completeGoal(token, id); loadGoals(); };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Delete this goal?')) { await deleteGoal(token, id); loadGoals(); }
  };

  const completedGoals = goals.filter(g => g.is_completed).length;

  // --- Summary counts ---
  const counts = {
    tasks: tasks.length,
    notes: notes.length,
    goals: goals.length,
  };

  // --- New button handler ---
  const handleNewClick = () => {
    if (activeTab === 'tasks') setShowTaskModal(true);
    else if (activeTab === 'notes') setShowNoteModal(true);
    else setShowGoalModal(true);
  };

  const newLabel = activeTab === 'tasks' ? '+ New Task' : activeTab === 'notes' ? '+ New Note' : '+ New Goal';

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Workspace</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {counts.tasks} tasks, {counts.notes} notes, {completedGoals}/{counts.goals} goals
            </p>
          </div>
          <button
            onClick={handleNewClick}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {newLabel}
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl mb-8"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--surface-2)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--muted)',
                border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full ml-1"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'var(--surface-2)',
                  color: activeTab === tab.id ? 'var(--accent-fg)' : 'var(--muted)',
                }}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div key="tasks" variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
              {tasksLoading && <Spinner size="lg" className="mt-20" />}
              {taskError && <p className="text-red-400 text-sm mb-4">{taskError}</p>}

              {!tasksLoading && tasks.length === 0 && (
                <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
                  <p className="text-base mb-1">No tasks yet</p>
                  <p className="text-sm">Create your first task to get started.</p>
                </div>
              )}

              {!tasksLoading && tasks.length > 0 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {tasks.map((task, i) => (
                    <div
                      key={task.id}
                      className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}
                    >
                      <button
                        onClick={() => togglePin(task.id)}
                        className="mt-0.5 shrink-0 transition-opacity"
                        style={{ opacity: task.pinned ? 1 : 0.2 }}
                        title={task.pinned ? 'Unpin' : 'Pin'}
                      >
                        <div className="h-2 w-2 rounded-full bg-white mt-1.5" />
                      </button>
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
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditTask(task)}
                          className="px-2.5 py-1 text-xs rounded-md transition-colors"
                          style={{ color: 'var(--muted)', backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'white'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-2.5 py-1 text-xs rounded-md text-red-500 transition-colors hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div key="notes" variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
              {notesLoading && <Spinner size="lg" className="mt-20" />}
              {noteError && <p className="text-red-400 text-sm mb-4">{noteError}</p>}

              {!notesLoading && notes.length === 0 && (
                <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
                  <p className="text-base mb-1">No notes yet</p>
                  <p className="text-sm">Start writing something.</p>
                </div>
              )}

              {!notesLoading && notes.length > 0 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {notes.map((note, i) => (
                    <div
                      key={note.id}
                      className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white">{note.title}</p>
                        {note.content && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>{note.content}</p>
                        )}
                        <span className="text-xs mt-2 block" style={{ color: 'var(--muted)' }}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditNote(note)}
                          className="px-2.5 py-1 text-xs rounded-md transition-colors"
                          style={{ color: 'var(--muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'white'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="px-2.5 py-1 text-xs rounded-md text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div key="goals" variants={tabContentVariants} initial="initial" animate="animate" exit="exit">
              {goalsLoading && <Spinner size="lg" className="mt-20" />}
              {goalError && <p className="text-red-400 text-sm mb-4">{goalError}</p>}

              {!goalsLoading && goals.length === 0 && (
                <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
                  <p className="text-base mb-1">No goals yet</p>
                  <p className="text-sm">Set your first goal to get started.</p>
                </div>
              )}

              {!goalsLoading && goals.length > 0 && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {goals.map((goal, i) => (
                    <div
                      key={goal.id}
                      className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                      style={{
                        borderBottom: i < goals.length - 1 ? '1px solid var(--border)' : 'none',
                        backgroundColor: 'var(--surface)',
                        opacity: goal.is_completed ? 0.6 : 1,
                      }}
                    >
                      <button
                        onClick={() => !goal.is_completed && handleCompleteGoal(goal.id)}
                        className="mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: goal.is_completed ? '#22c55e' : 'var(--border)',
                          backgroundColor: goal.is_completed ? '#22c55e22' : 'transparent',
                        }}
                        title={goal.is_completed ? 'Completed' : 'Mark complete'}
                      >
                        {goal.is_completed && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="2">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm text-white ${goal.is_completed ? 'line-through' : ''}`}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {goal.is_completed ? (
                            <span className="text-xs" style={{ color: '#22c55e' }}>Completed</span>
                          ) : (
                            goal.target_date && (
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>Target: {goal.target_date}</span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!goal.is_completed && (
                          <button
                            onClick={() => handleCompleteGoal(goal.id)}
                            className="px-2.5 py-1 text-xs rounded-md transition-colors"
                            style={{ color: '#22c55e' }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="px-2.5 py-1 text-xs rounded-md text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Modal */}
        <AnimatePresence>
          {(showTaskModal || editTask) && (
            <motion.div
              key="task-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={closeTaskModal}
            >
              <motion.div
                key="task-modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-md rounded-xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">{editTask ? 'Edit Task' : 'New Task'}</h2>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required className={inputClass} style={inputStyle} placeholder="Task title" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Description</label>
                    <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} className={inputClass} style={{ ...inputStyle, resize: 'none' }} placeholder="Optional description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white">Priority</label>
                      <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className={inputClass} style={inputStyle}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white">Due Date</label>
                      <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      {editTask ? 'Save Changes' : 'Create Task'}
                    </button>
                    <button type="button" onClick={closeTaskModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note Modal */}
        <AnimatePresence>
          {(showNoteModal || editNote) && (
            <motion.div
              key="note-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={closeNoteModal}
            >
              <motion.div
                key="note-modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-md rounded-xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">{editNote ? 'Edit Note' : 'New Note'}</h2>
                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} required placeholder="Note title" className={inputClass} style={inputStyle} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Content</label>
                    <textarea rows={6} value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="Write your note..." className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      {editNote ? 'Save Changes' : 'Create Note'}
                    </button>
                    <button type="button" onClick={closeNoteModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Modal */}
        <AnimatePresence>
          {showGoalModal && (
            <motion.div
              key="goal-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={closeGoalModal}
            >
              <motion.div
                key="goal-modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-md rounded-xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">New Goal</h2>
                <form onSubmit={handleGoalSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} required placeholder="Goal title" className={inputClass} style={inputStyle} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Description</label>
                    <textarea value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })} rows={3} placeholder="Optional description" className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Target Date</label>
                    <input type="date" value={goalForm.target_date} onChange={e => setGoalForm({ ...goalForm, target_date: e.target.value })} className={inputClass} style={inputStyle} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      Create Goal
                    </button>
                    <button type="button" onClick={closeGoalModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
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
