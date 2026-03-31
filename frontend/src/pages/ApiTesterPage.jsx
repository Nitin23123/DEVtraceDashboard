import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { sendRequest, getHistory } from '../api/apiTester';
import Spinner from '../components/Spinner';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const inputClass = 'px-4 py-2.5 rounded-lg text-sm text-white transition focus:outline-none';
const inputStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' };

function statusColor(status) {
  if (!status) return '#888';
  if (status >= 200 && status < 300) return '#22c55e';
  if (status >= 400 && status < 500) return '#f59e0b';
  if (status >= 500) return '#ef4444';
  return '#888';
}

export default function ApiTesterPage() {
  const { token } = useAuth();
  const [method, setMethod]         = useState('GET');
  const [url, setUrl]               = useState('');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText]     = useState('');
  const [response, setResponse]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [history, setHistory]       = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await getHistory(token);
    if (data.history) setHistory(data.history);
    setHistoryLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('URL is required'); return; }
    setError('');
    setLoading(true);
    setResponse(null);

    let parsedHeaders = {};
    if (headersText.trim()) {
      try { parsedHeaders = JSON.parse(headersText); }
      catch {
        setError('Headers must be valid JSON');
        setLoading(false);
        return;
      }
    }

    let parsedBody = undefined;
    if (bodyText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try { parsedBody = JSON.parse(bodyText); }
      catch { parsedBody = bodyText; }
    }

    const data = await sendRequest(token, { method, url: url.trim(), headers: parsedHeaders, body: parsedBody });
    setResponse(data);
    setLoading(false);
    loadHistory();
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">API Tester</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Send HTTP requests and inspect responses</p>
        </div>

        {/* Request form */}
        <div className="rounded-xl border p-5 mb-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSend} className="space-y-4">
            {/* Method + URL */}
            <div className="flex gap-2">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className={`${inputClass} font-mono font-bold w-28 shrink-0`}
                style={{ ...inputStyle, color: statusColor(method === 'DELETE' ? 500 : method === 'GET' ? 200 : 201) }}
              >
                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className={`${inputClass} flex-1 w-full`}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Sending…' : 'Send'}
              </button>
            </div>

            {/* Headers */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Headers (JSON)</label>
              <textarea
                placeholder='{"Authorization": "Bearer token"}'
                value={headersText}
                onChange={e => setHeadersText(e.target.value)}
                rows={2}
                className={`${inputClass} w-full font-mono`}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Body (JSON)</label>
                <textarea
                  placeholder='{"key": "value"}'
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  rows={4}
                  className={`${inputClass} w-full font-mono`}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        </div>

        {/* Response */}
        {response && (
          <div className="rounded-xl border overflow-hidden mb-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-medium text-white">Response</span>
              <span className="text-sm font-bold font-mono" style={{ color: statusColor(response.status) }}>
                {response.status || 'Error'}
              </span>
            </div>
            <pre
              className="px-5 py-4 text-xs font-mono overflow-auto max-h-72"
              style={{ backgroundColor: 'var(--surface-2)', color: '#d4d4d4' }}
            >
              {JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">History</h2>
          {historyLoading && <Spinner size="sm" className="py-4" />}
          {!historyLoading && history.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>No requests yet.</p>
          )}
          {history.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {history.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-5 py-3 text-sm"
                  style={{
                    borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <span className="font-mono text-xs font-bold shrink-0" style={{ color: 'var(--muted)', minWidth: 52 }}>
                    {entry.method}
                  </span>
                  <span className="flex-1 truncate text-xs" style={{ color: 'var(--muted)' }}>{entry.url}</span>
                  <span className="text-xs font-bold font-mono shrink-0" style={{ color: statusColor(entry.response_status) }}>
                    {entry.response_status || 'ERR'}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
