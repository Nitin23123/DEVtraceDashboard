import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sendRequest, getHistory } from '../api/apiTester';

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

  const statusColor = (status) => {
    if (!status) return '#6b7280';
    if (status >= 200 && status < 300) return '#16a34a';
    if (status >= 400 && status < 500) return '#d97706';
    if (status >= 500) return '#dc2626';
    return '#6b7280';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <h1>API Tester</h1>

      <form onSubmit={handleSend} style={{ marginBottom: '24px' }}>
        {/* Method + URL row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}
          >
            {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="text"
            placeholder="https://api.example.com/endpoint"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '8px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Headers */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Headers (JSON)
          </label>
          <textarea
            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
            value={headersText}
            onChange={e => setHeadersText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Body (only shown for POST/PUT/PATCH) */}
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Body (JSON)
            </label>
            <textarea
              placeholder='{"key": "value"}'
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              rows={5}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {error && <p style={{ color: '#dc2626', margin: '4px 0' }}>{error}</p>}
      </form>

      {/* Response */}
      {response && (
        <div style={{ marginBottom: '32px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <strong>Response</strong>
            <span style={{
              fontWeight: 'bold',
              color: statusColor(response.status),
              fontSize: '16px'
            }}>
              {response.status || 'Error'}
            </span>
          </div>
          <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '13px', fontFamily: 'monospace', backgroundColor: '#1e293b', color: '#e2e8f0', maxHeight: '300px', overflowY: 'auto' }}>
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}

      {/* History */}
      <div>
        <h2 style={{ marginBottom: '12px' }}>Request History</h2>
        {historyLoading && <p>Loading history...</p>}
        {!historyLoading && history.length === 0 && <p style={{ color: '#6b7280' }}>No requests sent yet.</p>}
        {history.map(entry => (
          <div key={entry.id} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '10px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '60px', color: '#1e293b' }}>{entry.method}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569', fontSize: '14px' }}>{entry.url}</span>
            <span style={{ fontWeight: 'bold', color: statusColor(entry.response_status), minWidth: '40px', textAlign: 'right' }}>
              {entry.response_status || 'ERR'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '12px', minWidth: '80px', textAlign: 'right' }}>
              {new Date(entry.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
