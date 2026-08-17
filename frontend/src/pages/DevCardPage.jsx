import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useAuth } from '../hooks/useAuth';
import { useDisplayName } from '../context/DisplayNameContext';
import { getStats } from '../api/dashboard';
import { getProblems } from '../api/dsa';
import Spinner from '../components/Spinner';
import { Card, CardHead, Label, Chip, GradButton, GhostButton, Page } from '../components/ui';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const CAMPUSES = ['USICT', 'MAIT', 'MSIT', 'BVCOE', 'BPIT', 'GTBIT', 'ADGITM', 'Other'];

const TERM = {
  green: '#4ADE80',
  cyan: '#7DD3FC',
  amber: '#FBBF24',
  red: '#F87171',
  pink: '#F0A08C',
  violet: '#C4B5FD',
};

// "DT" drawn in box-drawing characters, neofetch-style. Monospace-safe.
const ASCII_LOGO = [
  '██████╗ ████████╗',
  '██╔══██╗╚══██╔══╝',
  '██║  ██║   ██║   ',
  '██║  ██║   ██║   ',
  '██████╔╝   ██║   ',
  '╚═════╝    ╚═╝   ',
];

const LANG_COLORS = ['#F0A08C', '#A5B4FC', '#7DD3FC', '#4ADE80', '#FBBF24'];
const DIFF_COLOR = { Easy: TERM.green, Medium: TERM.amber, Hard: TERM.red };

const bar = (value, max, width = 10) => {
  const filled = max > 0 ? Math.round((value / max) * width) : 0;
  return '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(0, width - filled));
};

/** Weeks of the GitHub contribution calendar, most recent N. */
const recentWeeks = (github, count = 20) =>
  (github?.contributions?.calendar_weeks || []).slice(-count);

const heatColor = (n, max) => {
  if (!n) return 'var(--surface-2)';
  const r = n / (max || 1);
  if (r > 0.66) return 'var(--accent)';
  if (r > 0.33) return 'color-mix(in srgb, var(--accent) 65%, transparent)';
  return 'color-mix(in srgb, var(--accent) 35%, transparent)';
};

/** Aligned key/value line, as tool output prints it. */
const Info = ({ k, v, color }) => (
  <div className="flex items-baseline text-[11.5px] leading-[1.75]">
    <span style={{ color: 'var(--accent)', minWidth: 62 }}>{k}</span>
    <span style={{ color: color || 'var(--text)' }}>{v}</span>
  </div>
);

const Divider = () => <div style={{ borderTop: '1px dashed var(--border)' }} />;

function DeveloperCard({ cardRef, name, handle, campus, dsa, streak, longest, github, exporting }) {
  const weeks = recentWeeks(github);
  const maxDay = Math.max(
    1,
    ...weeks.flatMap((w) => (w.contributionDays || []).map((d) => d.contributionCount))
  );
  const langs = (github?.languages || []).slice(0, 5);
  const langTotal = langs.reduce((s, l) => s + l.count, 0);
  const c = github?.contributions;

  return (
    <div
      ref={cardRef}
      className="mono rounded-xl overflow-hidden w-full max-w-[480px]"
      style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        boxShadow: '0 28px 70px -28px rgba(0,0,0,0.6)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5"
        style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
        <span className="text-[10.5px] mx-auto" style={{ color: 'var(--muted)' }}>~/devtrace — zsh</span>
      </div>

      <div className="px-5 pt-4 pb-5 space-y-4">
        {/* Command */}
        <div className="text-[12px]">
          <span style={{ color: TERM.green }}>$</span>{' '}
          <span style={{ color: 'var(--text-soft)' }}>devtrace</span>{' '}
          <span style={{ color: TERM.cyan }}>--profile</span>
        </div>

        {/* neofetch-style: ASCII mark beside the info block */}
        <div className="flex gap-4">
          <pre
            className="text-[7.5px] leading-[1.15] shrink-0 select-none"
            style={{ color: 'var(--accent)', margin: 0 }}
          >
            {ASCII_LOGO.join('\n')}
          </pre>

          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>
              {name.toLowerCase().replace(/\s+/g, '')}
              <span style={{ color: 'var(--muted)' }}>@</span>
              <span style={{ color: TERM.violet }}>ggsipu</span>
            </div>
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <Info k="campus" v={campus} color={TERM.cyan} />
            {handle && <Info k="github" v={`@${handle}`} color={TERM.violet} />}
            <Info k="uptime" v={streak != null ? `${streak} day streak` : 'n/a'} color={TERM.pink} />
            <Info k="best" v={longest != null ? `${longest} days` : 'n/a'} />
            {c?.total_commits != null && <Info k="commits" v={`${c.total_commits} this year`} color={TERM.amber} />}
            {github?.public_repos != null && (
              <Info k="repos" v={`${github.public_repos}${github.total_stars ? ` · ${github.total_stars} ★` : ''}`} />
            )}
            {github?.prs_merged != null && (
              <Info k="pull_reqs" v={`${github.prs_merged} merged · ${github.prs_open} open`} color={TERM.green} />
            )}
          </div>
        </div>

        {/* Palette blocks — the neofetch signature */}
        <div className="flex gap-1">
          {['#FF5F57', TERM.amber, TERM.green, TERM.cyan, 'var(--accent)', TERM.violet, TERM.pink, 'var(--muted)'].map((col, i) => (
            <span key={i} style={{ width: 22, height: 8, backgroundColor: col, borderRadius: 1 }} />
          ))}
        </div>

        <Divider />

        {/* DSA breakdown by difficulty */}
        <div>
          <div className="flex items-center justify-between text-[10.5px] mb-2" style={{ color: 'var(--muted)' }}>
            <span>dsa curriculum</span>
            <span style={{ color: 'var(--accent)' }}>
              {dsa.total ? `${dsa.solved}/${dsa.total} · ${Math.round((dsa.solved / dsa.total) * 100)}%` : 'n/a'}
            </span>
          </div>
          {dsa.byDifficulty.map((d) => (
            <div key={d.diff} className="flex items-baseline gap-2 text-[11px] leading-[1.8]">
              <span style={{ color: DIFF_COLOR[d.diff], minWidth: 48 }}>{d.diff.toLowerCase()}</span>
              <span style={{ color: 'var(--accent)' }}>{bar(d.done, d.total)}</span>
              <span className="ml-auto tabular-nums" style={{ color: 'var(--text-soft)' }}>{d.done}/{d.total}</span>
            </div>
          ))}
        </div>

        {/* Language distribution */}
        {langs.length > 0 && (
          <>
            <Divider />
            <div>
              <div className="text-[10.5px] mb-2" style={{ color: 'var(--muted)' }}>languages</div>
              <div className="flex h-2 rounded-sm overflow-hidden">
                {langs.map((l, i) => (
                  <span key={l.lang} style={{ width: `${(l.count / langTotal) * 100}%`, backgroundColor: LANG_COLORS[i] }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px]">
                {langs.map((l, i) => (
                  <span key={l.lang} className="flex items-center gap-1.5" style={{ color: 'var(--text-soft)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: LANG_COLORS[i] }} />
                    {l.lang} {Math.round((l.count / langTotal) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contribution heatmap */}
        {weeks.length > 0 && (
          <>
            <Divider />
            <div>
              <div className="flex items-center justify-between text-[10.5px] mb-2" style={{ color: 'var(--muted)' }}>
                <span>contributions</span>
                <span>last {weeks.length} weeks</span>
              </div>
              <div className="flex gap-[3px]">
                {weeks.map((w, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {(w.contributionDays || []).map((d, di) => (
                      <span
                        key={di}
                        title={`${d.date}: ${d.contributionCount}`}
                        style={{ width: 7, height: 7, borderRadius: 1.5, backgroundColor: heatColor(d.contributionCount, maxDay) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Prompt */}
        <div className="text-[12px] flex items-center gap-2 pt-1">
          <span style={{ color: TERM.green }}>$</span>
          <span
            className={exporting ? '' : 'animate-pulse'}
            style={{ display: 'inline-block', width: 7, height: 14, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      <div
        className="px-5 py-2.5 flex items-center justify-between text-[10px]"
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <span>devtracedash.netlify.app</span>
        <span style={{ color: 'var(--accent)' }}>DevTrace™</span>
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
  const [dsa, setDsa] = useState({ solved: 0, total: 0, byDifficulty: [] });
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
      setDsa({
        solved: all.filter((p) => p.completed).length,
        total: all.length,
        byDifficulty: ['Easy', 'Medium', 'Hard'].map((diff) => {
          const set = all.filter((p) => p.difficulty === diff);
          return { diff, total: set.length, done: set.filter((p) => p.completed).length };
        }).filter((d) => d.total > 0),
      });
    }
    setGithub(gh);
    setLoading(false);
  }

  const name = displayName || (user?.email || '').split('@')[0] || 'developer';
  const handle = github?.login || null;
  const streak = stats?.streak?.current ?? null;
  const longest = stats?.streak?.longest ?? null;

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
      a.download = `devtrace-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      a.click();
      setNote('Card downloaded.');
    } catch {
      setNote('Could not render the image — try the copy option instead.');
    } finally {
      setBusy(false);
    }
  }

  async function copySummary() {
    const c = github?.contributions;
    const lines = [
      '$ devtrace --profile',
      '',
      `${name.toLowerCase().replace(/\s+/g, '')}@ggsipu`,
      `campus     ${campus}`,
      handle ? `github     @${handle}` : null,
      `uptime     ${streak != null ? `${streak} day streak` : 'n/a'}`,
      `dsa        ${dsa.total ? `${dsa.solved}/${dsa.total}` : 'n/a'}`,
      c?.total_commits != null ? `commits    ${c.total_commits} this year` : null,
      github?.languages?.[0]?.lang ? `top_lang   ${github.languages[0].lang}` : null,
      '',
      'tracked with DevTrace — devtracedash.netlify.app',
    ].filter((l) => l !== null);
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
            Developer Card
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: 'var(--text-soft)' }}>
            Your real numbers, in a card worth sharing.
          </p>
        </div>

        {loading && <Spinner size="lg" className="mt-16" />}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
            <div className="flex justify-center lg:justify-start">
              <DeveloperCard
                cardRef={cardRef}
                name={name}
                handle={handle}
                campus={campus}
                dsa={dsa}
                streak={streak}
                longest={longest}
                github={github}
                exporting={busy}
              />
            </div>

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
                  <Label>Data on the card</Label>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      { k: 'name', v: name, ok: true },
                      { k: 'dsa', v: dsa.total ? `${dsa.solved}/${dsa.total}` : 'unavailable', ok: dsa.total > 0 },
                      { k: 'streak', v: streak != null ? `${streak} days` : 'unavailable', ok: streak != null },
                      { k: 'github', v: github ? `@${github.login}` : 'not connected', ok: Boolean(github) },
                      { k: 'languages', v: github?.languages?.length ? `${github.languages.length} tracked` : 'unavailable', ok: Boolean(github?.languages?.length) },
                      { k: 'heatmap', v: github?.contributions?.calendar_weeks?.length ? 'loaded' : 'unavailable', ok: Boolean(github?.contributions?.calendar_weeks?.length) },
                    ].map((row) => (
                      <li key={row.k} className="flex items-center justify-between text-[13px]">
                        <span className="mono text-[12px]" style={{ color: 'var(--muted)' }}>{row.k}</span>
                        <span className="mono text-[11.5px]" style={{ color: row.ok ? 'var(--accent)' : 'var(--muted)' }}>
                          {row.v}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!github && (
                    <p className="mono text-[10.5px] mt-3" style={{ color: 'var(--muted)' }}>
                      Connect GitHub on your Profile page to unlock repos, stars, pull requests, the language bar and the contribution heatmap.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <GradButton onClick={downloadPng} disabled={busy}>
                    {busy ? 'Rendering…' : 'Download PNG'}
                  </GradButton>
                  <GhostButton onClick={copySummary}>Copy as text</GhostButton>
                </div>

                {note && <p className="mono text-[11px]" style={{ color: 'var(--accent)' }}>{note}</p>}

                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip>PNG at 2× resolution</Chip>
                    <Chip>Follows your theme</Chip>
                    <Chip>Real data only</Chip>
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
