import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';

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
    <div style={{ padding: '20px' }}>
      <h1>Notes</h1>
      <button onClick={() => setShowCreateModal(true)}>+ New Note</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && notes.length === 0 && <p>No notes yet. Create your first note!</p>}

      {notes.map(note => (
        <div key={note.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '12px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{note.title}</strong>
            <div>
              <button onClick={() => openEditModal(note)}>Edit</button>
              <button onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </div>
          {note.content && <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>}
          <small>{new Date(note.created_at).toLocaleDateString()}</small>
        </div>
      ))}

      {(showCreateModal || editNote) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h2>{editNote ? 'Edit Note' : 'New Note'}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Title *</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Content</label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div>
                <button type="submit">{editNote ? 'Save Changes' : 'Create Note'}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
