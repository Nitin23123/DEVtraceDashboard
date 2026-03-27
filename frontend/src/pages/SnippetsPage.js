import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    <div style={{ padding: '24px', maxWidth: '860px', color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: 'var(--text)' }}>Code Snippets</h1>
        <button
          onClick={openCreate}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + New Snippet
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text)', opacity: 0.6 }}>Loading...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text)' }}>
            {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
          </h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Debounce function"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Language</label>
              <select
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                style={{
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Code *</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                rows={20}
                placeholder="Paste your code here..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {editingSnippet ? 'Save Changes' : 'Create Snippet'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: 'none',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Snippet List */}
      {!loading && snippets.length === 0 && !showForm && (
        <p style={{ color: 'var(--text)', opacity: 0.6 }}>No snippets yet. Create your first one!</p>
      )}

      {snippets.map(snippet => (
        <div
          key={snippet.id}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <strong style={{ flex: 1, fontSize: '15px', color: 'var(--text)' }}>{snippet.title}</strong>
            {/* Language badge */}
            <span style={{
              background: LANG_COLORS[snippet.language] ? `${LANG_COLORS[snippet.language]}22` : '#94a3b822',
              color: LANG_COLORS[snippet.language] || '#94a3b8',
              border: `1px solid ${LANG_COLORS[snippet.language] || '#94a3b8'}44`,
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {snippet.language}
            </span>
            {/* Action buttons */}
            <button
              onClick={() => toggleExpand(snippet.id)}
              style={{ background: 'none', color: 'var(--text)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
            >
              {expandedIds.has(snippet.id) ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={() => handleCopy(snippet.content)}
              style={{ background: 'none', color: '#6366f1', border: '1px solid #6366f1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Copy
            </button>
            <button
              onClick={() => openEdit(snippet)}
              style={{ background: 'none', color: 'var(--text)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(snippet.id)}
              style={{ background: 'none', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
            >
              Delete
            </button>
          </div>

          {/* Expanded code block */}
          {expandedIds.has(snippet.id) && (
            <pre style={{
              marginTop: '12px',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              background: 'var(--bg)',
              color: 'var(--text)',
              padding: '12px',
              borderRadius: '6px',
              overflowX: 'auto',
              fontSize: '13px',
              border: '1px solid var(--border)'
            }}>
              {snippet.content}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
