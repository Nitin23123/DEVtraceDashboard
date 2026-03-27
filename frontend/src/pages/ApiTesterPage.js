import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sendRequest, getHistory } from '../api/apiTester';
import Spinner from '../components/Spinner';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ApiTesterPage() {
  const { token } = useAuth();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await getHistory(token);
    if (data.history) setHistory(data.history);
    setHistoryLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    setError('');
    setLoading(true);
    setResponse(null);

    let parsedHeaders = {};
    if (headersText.trim()) {
      try {
        parsedHeaders = JSON.parse(headersText);
      } catch {
        setError('Headers must be valid JSON (e.g. {"Content-Type": "application/json"})');
        setLoading(false);
        return;
      }
    }

    let parsedBody = undefined;
    if (bodyText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText; // allow plain text body
      }
    }

    const data = await sendRequest(token, {
      method,
      url: url.trim(),
      headers: parsedHeaders,
      body: parsedBody,
    });

    setResponse(data);
    setLoading(false);
    loadHistory();
  };

  const statusBadgeClass = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-700';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-700';
    if (status >= 500) return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">API Tester</h1>

      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <form onSubmit={handleSend}>
          {/* Method + URL row */}
          <div className="flex gap-2 mb-3">
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-accent-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Spinner size="sm" />}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Headers */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-text/80 mb-1">Headers (JSON)</label>
            <textarea
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              value={headersText}
              onChange={e => setHeadersText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Body (only shown for POST/PUT/PATCH) */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-text/80 mb-1">Body (JSON)</label>
              <textarea
                placeholder='{"key": "value"}'
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <strong className="text-text text-sm">Response</strong>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadgeClass(response.status)}`}>
              {response.status || 'Error'}
            </span>
          </div>
          <pre className="bg-bg p-4 text-sm font-mono text-text/80 overflow-auto max-h-64">
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Request History</h2>
        {historyLoading && <Spinner size="sm" className="py-4" />}
        {!historyLoading && history.length === 0 && (
          <p className="text-text/50 text-sm py-4 text-center">No requests yet.</p>
        )}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {history.map((entry, i) => (
            <div key={entry.id} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i < history.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="font-mono text-xs bg-border/60 px-1.5 py-0.5 rounded font-bold text-text shrink-0">
                {entry.method}
              </span>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-text/70">
                {entry.url}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusBadgeClass(entry.response_status)}`}>
                {entry.response_status || 'ERR'}
              </span>
              <span className="text-text/40 text-xs shrink-0">
                {new Date(entry.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
