import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'SQL', 'Bash', 'Other'];

const LANG_DOT = {
  JavaScript: '#f1e05a',
  Python:     '#3572A5',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  SQL:        '#e38c00',
  Bash:       '#89e051',
  Other:      '#888888',
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

export default function SnippetsPage() {
  const { token } = useAuth();
  const [snippets, setSnippets]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [form, setForm]             = useState({ title: '', language: 'JavaScript', content: '' });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copied, setCopied]         = useState(null);

  const authHeader = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  useEffect(() => { fetchSnippets(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSnippets() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/snippets`, { headers: authHeader });
      const data = await res.json();
      if (Array.isArray(data)) setSnippets(data);
      else setError(data.error || 'Failed to load snippets');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  function resetForm() {
    setForm({ title: '', language: 'JavaScript', content: '' });
    setEditingSnippet(null);
    setShowForm(false);
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
    } catch { setError('Failed to save snippet'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await fetch(`${API_URL}/api/snippets/${id}`, { method: 'DELETE', headers: authHeader });
      setSnippets(prev => prev.filter(s => s.id !== id));
    } catch { setError('Failed to delete snippet'); }
  }

  function handleCopy(id, content) {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Snippets</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{snippets.length} saved</p>
          </div>
          <button
            onClick={() => { setEditingSnippet(null); setForm({ title: '', language: 'JavaScript', content: '' }); setShowForm(true); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + New Snippet
          </button>
        </div>

        {loading && <Spinner size="lg" className="mt-20" />}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!loading && snippets.length === 0 && !showForm && (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-base mb-1">No snippets yet</p>
            <p className="text-sm">Save your first code snippet.</p>
          </div>
        )}

        {/* Snippet list */}
        <div className="space-y-3">
          {snippets.map(snippet => (
            <div
              key={snippet.id}
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header row */}
              <div className="group flex items-center gap-3 px-5 py-4">
                {/* Language dot */}
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: LANG_DOT[snippet.language] || '#888' }}
                />
                <span className="flex-1 font-medium text-sm text-white truncate">{snippet.title}</span>
                <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{snippet.language}</span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleExpand(snippet.id)}
                    className="px-2.5 py-1 text-xs rounded-md transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                  >
                    {expandedIds.has(snippet.id) ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => handleCopy(snippet.id, snippet.content)}
                    className="px-2.5 py-1 text-xs rounded-md transition-colors"
                    style={{ color: copied === snippet.id ? '#22c55e' : 'var(--muted)' }}
                    onMouseEnter={e => { if (copied !== snippet.id) e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { if (copied !== snippet.id) e.currentTarget.style.color = 'var(--muted)'; }}
                  >
                    {copied === snippet.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => openEdit(snippet)}
                    className="px-2.5 py-1 text-xs rounded-md transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(snippet.id)}
                    className="px-2.5 py-1 text-xs rounded-md text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Code block */}
              {expandedIds.has(snippet.id) && (
                <pre
                  className="px-5 py-4 text-xs font-mono overflow-x-auto"
                  style={{
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-2)',
                    color: '#d4d4d4',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {snippet.content}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
              onClick={resetForm}
            >
              <motion.div
                key="modal"
                variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="w-full max-w-2xl rounded-xl border p-6 max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-white mb-5">
                  {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Title</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Debounce function" className={inputClass} style={inputStyle} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Language</label>
                    <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className={inputClass} style={inputStyle}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white">Code</label>
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={14} placeholder="Paste your code here…" className={`${inputClass} font-mono`} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      {editingSnippet ? 'Save Changes' : 'Create Snippet'}
                    </button>
                    <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-sm border transition" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
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
