import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

const NotesPage = () => {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    setLoading(true);
    const data = await getNotes(token);
    if (data.notes) setNotes(data.notes);
    else setError('Failed to load notes');
    setLoading(false);
  };

  const openEditModal = (note) => {
    setEditNote(note);
    setFormData({ title: note.title, content: note.content || '' });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditNote(null);
    setFormData({ title: '', content: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editNote) await updateNote(token, editNote.id, formData);
    else await createNote(token, formData);
    await loadNotes();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      await deleteNote(token, id);
      await loadNotes();
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Notes</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{notes.length} total</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + New Note
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!loading && notes.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-base mb-1">No notes yet</p>
            <p className="text-sm">Start writing something.</p>
          </div>
        )}

        {/* Notes list */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
              style={{
                borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--surface)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{note.title}</p>
                {note.content && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {note.content}
                  </p>
                )}
                <span className="text-xs mt-2 block" style={{ color: 'var(--muted)' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Actions — hover only */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(note)}
                  className="px-2.5 py-1 text-xs rounded-md transition-colors"
                  style={{ color: 'var(--muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-2.5 py-1 text-xs rounded-md text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {(showCreateModal || editNote) && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={closeModal}
          >
            <div
              className="w-full max-w-md rounded-xl border p-6"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-5">{editNote ? 'Edit Note' : 'New Note'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Title</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Note title"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Content</label>
                  <textarea
                    rows={6}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note…"
                    className={inputClass}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                    {editNote ? 'Save Changes' : 'Create Note'}
                  </button>
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotesPage;
