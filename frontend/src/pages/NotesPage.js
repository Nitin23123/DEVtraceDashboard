import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

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
    if (editNote) {
      await updateNote(token, editNote.id, formData);
    } else {
      await createNote(token, formData);
    }
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
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Notes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + New Note
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-12" />}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}
        {!loading && notes.length === 0 && (
          <div className="text-center py-16 text-text/50">
            <p>No notes yet. Start writing.</p>
          </div>
        )}

        {notes.map(note => (
          <div key={note.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-text mb-1 flex-1">{note.title}</h3>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(note)}
                  className="text-xs px-2 py-1 rounded text-text/60 hover:text-text hover:bg-border/40 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-xs px-2 py-1 rounded text-red-400 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            {note.content && (
              <p className="text-text/70 text-sm whitespace-pre-wrap">{note.content}</p>
            )}
            <span className="text-xs text-text/40 mt-2 block">
              {new Date(note.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}

        {(showCreateModal || editNote) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-text mb-5">{editNote ? 'Edit Note' : 'New Note'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-text/80 mb-1">Title *</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-text/80 mb-1">Content</label>
                  <textarea
                    rows={6}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {editNote ? 'Save Changes' : 'Create Note'}
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
    </motion.div>
  );
};

export default NotesPage;
