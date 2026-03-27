import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'SQL', 'Bash', 'Other'];

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  SQL: '#e38c00',
  Bash: '#89e051',
  Other: '#94a3b8',
};

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export default function SnippetsPage() {
  const { token } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [form, setForm] = useState({ title: '', language: 'JavaScript', content: '' });
  const [expandedIds, setExpandedIds] = useState(new Set());

  const authHeader = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  useEffect(() => {
    fetchSnippets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSnippets() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/snippets`, { headers: authHeader });
      const data = await res.json();
      if (Array.isArray(data)) setSnippets(data);
      else setError(data.error || 'Failed to load snippets');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: '', language: 'JavaScript', content: '' });
    setEditingSnippet(null);
    setShowForm(false);
  }

  function openCreate() {
    setEditingSnippet(null);
    setForm({ title: '', language: 'JavaScript', content: '' });
    setShowForm(true);
  }

  function openEdit(snippet) {
    setEditingSnippet(snippet);
    setForm({ title: snippet.title, language: snippet.language, content: snippet.content });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editingSnippet) {
        const res = await fetch(`${API_URL}/api/snippets/${editingSnippet.id}`, {
          method: 'PUT',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setSnippets(prev => prev.map(s => s.id === editingSnippet.id ? updated : s));
      } else {
        const res = await fetch(`${API_URL}/api/snippets`, {
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setSnippets(prev => [created, ...prev]);
      }
      resetForm();
    } catch {
      setError('Failed to save snippet');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await fetch(`${API_URL}/api/snippets/${id}`, { method: 'DELETE', headers: authHeader });
      setSnippets(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete snippet');
    }
  }

  function handleCopy(content) {
    navigator.clipboard.writeText(content).then(() => alert('Copied to clipboard!'));
  }

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Code Snippets</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + New Snippet
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-12" />}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && snippets.length === 0 && !showForm && (
          <div className="text-center py-16 text-text/50">
            <p className="text-lg mb-1">No snippets yet</p>
            <p className="text-sm">Create your first one!</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={resetForm}
            >
              <motion.div
                key="modal-card"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-surface rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-text mb-5">
                  {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
                </h2>
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-text/80 mb-1">Title *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      required
                      placeholder="e.g. Debounce function"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-text/80 mb-1">Language</label>
                    <select
                      value={form.language}
                      onChange={e => setForm({ ...form, language: e.target.value })}
                      className="px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-text/80 mb-1">Code *</label>
                    <textarea
                      value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      required
                      rows={20}
                      placeholder="Paste your code here..."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y min-h-[120px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {editingSnippet ? 'Save Changes' : 'Create Snippet'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
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

        {/* Snippet List */}
        {snippets.map(snippet => (
          <div key={snippet.id} className="bg-surface border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="flex-1 text-text font-semibold">{snippet.title}</strong>
              {/* Language badge — data-driven colors */}
              <span style={{
                background: LANG_COLORS[snippet.language] ? `${LANG_COLORS[snippet.language]}22` : '#94a3b822',
                color: LANG_COLORS[snippet.language] || '#94a3b8',
                border: `1px solid ${LANG_COLORS[snippet.language] || '#94a3b8'}44`,
              }} className="text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {snippet.language}
              </span>
              <button
                onClick={() => toggleExpand(snippet.id)}
                className="text-xs px-2 py-1 rounded border border-border text-text/60 hover:text-text hover:bg-border/40 transition"
              >
                {expandedIds.has(snippet.id) ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={() => handleCopy(snippet.content)}
                className="text-xs px-2 py-1 rounded border border-accent text-accent hover:bg-accent/10 transition font-semibold"
              >
                Copy
              </button>
              <button
                onClick={() => openEdit(snippet)}
                className="text-xs px-2 py-1 rounded border border-border text-text/60 hover:text-text hover:bg-border/40 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(snippet.id)}
                className="text-xs px-2 py-1 rounded text-red-400 hover:text-red-600 transition"
              >
                Delete
              </button>
            </div>

            {expandedIds.has(snippet.id) && (
              <pre className="bg-bg rounded-lg p-3 text-sm font-mono text-text/80 overflow-x-auto mt-2 border border-border whitespace-pre-wrap">
                {snippet.content}
              </pre>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
