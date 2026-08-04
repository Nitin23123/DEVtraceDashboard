import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useAuth } from '../hooks/useAuth';
import { useDisplayName } from '../context/DisplayNameContext';
import { getStats } from '../api/dashboard';
import { getProblems } from '../api/dsa';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { Card, CardHead, Label, Bar, Chip, GradButton, GhostButton, Page } from '../components/ui';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const CAMPUSES = ['USICT', 'MAIT', 'MSIT', 'BVCOE', 'BPIT', 'GTBIT', 'ADGITM', 'Other'];

/**
 * The shareable card itself. Kept as a separate component with a forwarded ref
 * so html-to-image can rasterise exactly this node and nothing else.
 */
function DeveloperCard({ cardRef, name, handle, campus, solved, total, streak, github }) {
  const pct = total ? Math.round((solved / total) * 100) : 0;

  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden w-full max-w-[440px]"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Gradient cap */}
      <div style={{ height: 4, backgroundImage: 'var(--grad)' }} />

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[15px] font-bold grad-text">DevTrace</span>
          </div>
          <span
            className="mono text-[10px] px-2 py-1 rounded"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }}
          >
            {campus}
          </span>
        </div>

        <div className="mt-6">
          <div className="text-[24px] font-bold leading-tight" style={{ color: 'var(--text)' }}>{name}</div>
          {handle && <div className="mono text-[12px] mt-1" style={{ color: 'var(--muted)' }}>@{handle}</div>}
          <div className="mono text-[10.5px] uppercase tracking-[0.16em] mt-2" style={{ color: 'var(--muted)' }}>
            GGSIPU Engineering Student
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { k: 'DSA solved', v: total ? `${solved} / ${total}` : '—' },
            { k: 'Active streak', v: streak != null ? `${streak} days` : '—' },
            { k: 'Commits this year', v: github?.contributions?.total_commits ?? '—' },
            { k: 'Top language', v: github?.languages?.[0]?.lang ?? '—' },
          ].map((s) => (
            <div key={s.k} className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>{s.k}</div>
              <div className="mono text-[16px] font-bold mt-1 tnum" style={{ color: 'var(--text)' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Curriculum progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Curriculum
            </span>
            <span className="mono text-[11px] tnum" style={{ color: 'var(--accent)' }}>{pct}%</span>
          </div>
          <Bar value={solved} max={total || 1} height={6} />
        </div>

        <div
          className="mt-6 pt-4 flex items-center justify-between mono text-[10px]"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          <span>devtracedash.netlify.app</span>
          <span>Verified by DevTrace</span>
        </div>
      </div>
    </div>
  );
}

export default function DevCardPage() {
  const { token, user } = useAuth();
  const { displayName } = useDisplayName();
  const cardRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dsa, setDsa] = useState({ solved: 0, total: 0 });
  const [github, setGithub] = useState(null);
  const [campus, setCampus] = useState(() => localStorage.getItem('campus') || 'USICT');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { localStorage.setItem('campus', campus); }, [campus]);

  async function load() {
    setLoading(true);
    const [s, problems, gh] = await Promise.all([
      getStats(token).catch(() => null),
      getProblems(token).catch(() => null),
      fetch(`${API_URL}/api/profile/github`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    setStats(s && s.tasks !== undefined ? s : null);
    if (Array.isArray(problems)) {
      const all = problems.flatMap((d) => d.problems || []);
      setDsa({ solved: all.filter((p) => p.completed).length, total: all.length });
    }
    setGithub(gh);
    setLoading(false);
  }

  const name = displayName || (user?.email || '').split('@')[0] || 'Developer';
  const handle = github?.login || null;
  const streak = stats?.streak?.current ?? null;

  async function downloadPng() {
    if (!cardRef.current) return;
    setBusy(true);
    setNote('');
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0A0A0F',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `devtrace-card-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      a.click();
      setNote('Card downloaded.');
    } catch {
      setNote('Could not render the image — try the copy option instead.');
    } finally {
      setBusy(false);
    }
  }

  async function copySummary() {
    const lines = [
      `${name} — GGSIPU (${campus})`,
      `DSA: ${dsa.solved}/${dsa.total} solved`,
      streak != null ? `Streak: ${streak} days` : null,
      github?.contributions?.total_commits ? `Commits this year: ${github.contributions.total_commits}` : null,
      'Tracked with DevTrace — devtracedash.netlify.app',
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setNote('Summary copied to clipboard.');
    } catch {
      setNote('Clipboard blocked by the browser.');
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Page>
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            GGSIPU Developer Card
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            One shareable card built from what DevTrace already tracks.
          </p>
        </div>

        {loading && <Spinner size="lg" className="mt-16" />}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
            {/* Card preview */}
            <div className="flex justify-center lg:justify-start">
              <DeveloperCard
                cardRef={cardRef}
                name={name}
                handle={handle}
                campus={campus}
                solved={dsa.solved}
                total={dsa.total}
                streak={streak}
                github={github}
              />
            </div>

            {/* Controls */}
            <Card>
              <CardHead title="Customise & share" subtitle="Nothing here is stored on the server" />
              <div className="p-5 space-y-6">
                <div>
                  <Label>Campus</Label>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CAMPUSES.map((c) => (
                      <GhostButton key={c} active={campus === c} onClick={() => setCampus(c)}>{c}</GhostButton>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>What's on the card</Label>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      { k: 'Display name', v: name, ok: true },
                      { k: 'DSA progress', v: dsa.total ? `${dsa.solved}/${dsa.total}` : 'unavailable', ok: dsa.total > 0 },
                      { k: 'Streak', v: streak != null ? `${streak} days` : 'unavailable', ok: streak != null },
                      { k: 'GitHub stats', v: github ? `@${github.login}` : 'not connected', ok: !!github },
                    ].map((row) => (
                      <li key={row.k} className="flex items-center justify-between text-[13px]">
                        <span style={{ color: 'var(--text-soft)' }}>{row.k}</span>
                        <span className="mono text-[11.5px]" style={{ color: row.ok ? 'var(--accent)' : 'var(--muted)' }}>
                          {row.v}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!github && (
                    <p className="mono text-[10.5px] mt-3" style={{ color: 'var(--muted)' }}>
                      Connect GitHub on your Profile page to add commit stats.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <GradButton onClick={downloadPng} disabled={busy}>
                    {busy ? 'Rendering…' : 'Download PNG'}
                  </GradButton>
                  <GhostButton onClick={copySummary}>Copy summary</GhostButton>
                </div>

                {note && (
                  <p className="mono text-[11px]" style={{ color: 'var(--accent)' }}>{note}</p>
                )}

                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip>PNG at 2× resolution</Chip>
                    <Chip>Follows your active theme</Chip>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Page>
    </motion.div>
  );
}
