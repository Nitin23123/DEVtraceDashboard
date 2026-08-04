import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { sendRequest, getHistory } from '../api/apiTester';
import Spinner from '../components/Spinner';
import { Card, CardHead, Chip, GradButton, Page } from '../components/ui';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const TABS = ['Headers', 'Body', 'History'];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const fieldStyle = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' };

function statusTone(status) {
  if (!status) return { bg: 'rgba(248,113,113,0.13)', fg: '#F87171' };
  if (status < 300) return { bg: 'rgba(74,222,128,0.13)', fg: '#4ADE80' };
  if (status < 500) return { bg: 'rgba(250,204,21,0.13)', fg: '#FACC15' };
  return { bg: 'rgba(248,113,113,0.13)', fg: '#F87171' };
}

const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export default function ApiTesterPage() {
  const { token } = useAuth();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [response, setResponse] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('Headers');
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadHistory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = async () => {
    try {
      const data = await getHistory(token);
      if (data.history) setHistory(data.history);
    } catch { /* history is non-critical */ }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('URL is required'); return; }
    setError('');
    setLoading(true);
    setResponse(null);
    setElapsed(null);

    let parsedHeaders = {};
    if (headersText.trim()) {
      try { parsedHeaders = JSON.parse(headersText); }
      catch { setError('Headers must be valid JSON'); setLoading(false); return; }
    }

    let parsedBody;
    if (bodyText.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try { parsedBody = JSON.parse(bodyText); } catch { parsedBody = bodyText; }
    }

    const started = performance.now();
    const data = await sendRequest(token, { method, url: url.trim(), headers: parsedHeaders, body: parsedBody });
    setElapsed(Math.round(performance.now() - started));
    setResponse(data);
    setLoading(false);
    loadHistory();
  };

  const pretty = response ? JSON.stringify(response.body, null, 2) : '';
  const sizeKb = pretty ? (new Blob([pretty]).size / 1024).toFixed(1) : null;
  const lines = pretty ? pretty.split('\n') : [];

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard may be blocked */ }
  };

  const downloadResponse = () => {
    const blob = new Blob([pretty], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'response.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page wide>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            API Sandbox
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            Send requests through the server proxy — no CORS limits, every call logged.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── Request ─────────────────────────────────────────────── */}
          <Card className="flex flex-col">
            <CardHead title="Request" action={<Chip>REST</Chip>} />

            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mono text-[12px] font-bold px-3 py-2.5 rounded-lg focus:outline-none"
                  style={fieldStyle}
                >
                  {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mono text-[12px] flex-1 min-w-[160px] px-3 py-2.5 rounded-lg focus:outline-none"
                  style={fieldStyle}
                />
                <GradButton type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : null}
                  {loading ? 'Sending…' : 'Send'}
                </GradButton>
              </div>

              {/* Tabs */}
              <div className="flex gap-5" style={{ borderBottom: '1px solid var(--border)' }}>
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className="mono text-[11.5px] pb-2.5 -mb-px transition-colors"
                    style={
                      tab === t
                        ? { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }
                        : { color: 'var(--muted)', borderBottom: '2px solid transparent' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'Headers' && (
                <textarea
                  placeholder={'{\n  "Authorization": "Bearer token"\n}'}
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  rows={8}
                  className="mono text-[12px] w-full px-3 py-2.5 rounded-lg focus:outline-none"
                  style={{ ...fieldStyle, resize: 'vertical' }}
                />
              )}

              {tab === 'Body' && (
                ['POST', 'PUT', 'PATCH'].includes(method) ? (
                  <textarea
                    placeholder={'{\n  "key": "value"\n}'}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={8}
                    className="mono text-[12px] w-full px-3 py-2.5 rounded-lg focus:outline-none"
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                ) : (
                  <p className="mono text-[11.5px] py-6 text-center" style={{ color: 'var(--muted)' }}>
                    {method} requests don't carry a body.
                  </p>
                )
              )}

              {tab === 'History' && (
                <div className="max-h-[240px] overflow-y-auto -mx-1 px-1" data-lenis-prevent>
                  {history.length === 0 ? (
                    <p className="mono text-[11.5px] py-6 text-center" style={{ color: 'var(--muted)' }}>No requests yet.</p>
                  ) : (
                    history.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => { setMethod(entry.method); setUrl(entry.url); }}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left"
                      >
                        <span className="mono text-[10px] font-bold shrink-0" style={{ color: 'var(--muted)', minWidth: 44 }}>
                          {entry.method}
                        </span>
                        <span className="mono text-[11px] flex-1 truncate" style={{ color: 'var(--text-soft)' }}>{entry.url}</span>
                        <Chip tone={statusTone(entry.response_status)}>{entry.response_status || 'ERR'}</Chip>
                      </button>
                    ))
                  )}
                </div>
              )}

              {error && <p className="mono text-[11.5px]" style={{ color: '#F87171' }}>{error}</p>}
            </form>
          </Card>

          {/* ── Response ────────────────────────────────────────────── */}
          <Card className="flex flex-col">
            <CardHead
              title="Response"
              action={
                <div className="flex items-center gap-2.5 shrink-0">
                  {response && (
                    <>
                      <Chip tone={statusTone(response.status)}>{response.status || 'ERR'}</Chip>
                      {elapsed != null && <span className="mono text-[10.5px]" style={{ color: 'var(--muted)' }}>{elapsed} ms</span>}
                      {sizeKb && <span className="mono text-[10.5px]" style={{ color: 'var(--muted)' }}>{sizeKb} KB</span>}
                      <button type="button" onClick={copyResponse} title="Copy" style={{ color: copied ? 'var(--accent)' : 'var(--muted)' }}>
                        <Icon d={<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
                      </button>
                      <button type="button" onClick={downloadResponse} title="Download" style={{ color: 'var(--muted)' }}>
                        <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />
                      </button>
                    </>
                  )}
                </div>
              }
            />

            <div className="flex-1 min-h-[380px] overflow-auto" style={{ backgroundColor: 'var(--bg)' }} data-lenis-prevent>
              {!response ? (
                <p className="mono text-[11.5px] p-6" style={{ color: 'var(--muted)' }}>
                  Send a request to see the response here.
                </p>
              ) : (
                <div className="flex mono text-[11.5px] leading-relaxed py-4">
                  <div className="px-3 text-right select-none shrink-0" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                    {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                  <pre className="px-2 flex-1 overflow-x-auto" style={{ color: 'var(--text-soft)' }}>{pretty}</pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Page>
    </motion.div>
  );
}
