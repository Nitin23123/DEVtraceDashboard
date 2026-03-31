import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
  Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

const CONTRIB_COLORS = ['#1a1a1a', '#1a3a2a', '#1e5c3a', '#22794a', '#22c55e'];
function contribColor(count) {
  if (count === 0) return CONTRIB_COLORS[0];
  if (count <= 3) return CONTRIB_COLORS[1];
  if (count <= 6) return CONTRIB_COLORS[2];
  if (count <= 9) return CONTRIB_COLORS[3];
  return CONTRIB_COLORS[4];
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="text-2xl font-bold" style={{ color: color || 'white' }}>{value ?? '—'}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

function ContribHeatmap({ calendarWeeks }) {
  if (!calendarWeeks || calendarWeeks.length === 0) return null;
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const monthLabels = [];
  calendarWeeks.forEach((week, wi) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getDate() <= 7) monthLabels.push({ wi, label: d.toLocaleString('default', { month: 'short' }) });
    }
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', marginLeft: 24, marginBottom: 2, position: 'relative', height: 14 }}>
        {monthLabels.map(({ wi, label }) => (
          <div key={wi} style={{ position: 'absolute', left: wi * 12, fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
          {DAY_LABELS.map((l, i) => (
            <div key={i} style={{ height: 10, fontSize: 9, color: 'var(--muted)', lineHeight: '10px', width: 20, textAlign: 'right' }}>{l}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {calendarWeeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {week.contributionDays.map((day, di) => (
                <div key={di} title={`${day.date}: ${day.contributionCount} contributions`}
                  style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: contribColor(day.contributionCount), cursor: 'default' }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>Less</span>
        {CONTRIB_COLORS.map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c, border: '1px solid #333' }} />)}
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>More</span>
      </div>
    </div>
  );
}

const ProfilePage = () => {
  const { token } = useAuth();
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [prs, setPrs]               = useState([]);
  const [prsLoading, setPrsLoading] = useState(false);
  const [prsError, setPrsError]     = useState(null);

  const loadGithubProfile = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/profile/github`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.status === 404) setGithubData(null);
      else if (!res.ok) setError(data.error || 'Failed to load GitHub profile');
      else setGithubData(data);
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('github')) window.history.replaceState({}, '', '/profile');
    loadGithubProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!githubData) return;
    setPrsLoading(true);
    fetch(`${API_URL}/api/profile/github/prs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPrs(data); else setPrsError(data.error || 'Failed to load PRs'); })
      .catch(() => setPrsError('Network error'))
      .finally(() => setPrsLoading(false));
  }, [githubData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-10">Profile</h1>
          <Spinner size="lg" className="mt-20" />
        </div>
      </motion.div>
    );
  }

  if (!githubData) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-10">Profile</h1>
          <div className="max-w-sm mx-auto text-center py-16">
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Connect your GitHub account to see your developer dashboard.</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <a
              href={`${API_URL}/api/auth/github?token=${token}`}
              className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', textDecoration: 'none' }}
            >
              Connect GitHub
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  const c = githubData.contributions || {};
  const memberSince = githubData.created_at ? new Date(githubData.created_at).getFullYear() : null;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Profile</h1>
        </div>

        {/* Identity */}
        <div className="rounded-xl border p-6 flex items-start gap-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <img src={githubData.avatar_url} alt="avatar" className="w-16 h-16 rounded-full shrink-0" style={{ border: '2px solid var(--border)' }} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white">{githubData.name || githubData.login}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>@{githubData.login}</p>
            {githubData.bio && <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>{githubData.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {githubData.location && <span className="text-xs" style={{ color: 'var(--muted)' }}>{githubData.location}</span>}
              {memberSince && <span className="text-xs" style={{ color: 'var(--muted)' }}>Since {memberSince}</span>}
              {githubData.blog && (
                <a href={githubData.blog.startsWith('http') ? githubData.blog : `https://${githubData.blog}`} target="_blank" rel="noreferrer" className="text-xs text-white hover:underline">{githubData.blog}</a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 items-end">
            <a href={githubData.html_url} target="_blank" rel="noreferrer" className="text-xs text-white hover:underline">GitHub →</a>
            <a href={`${API_URL}/api/auth/github?token=${token}`} className="text-xs hover:underline" style={{ color: 'var(--muted)' }}>Reconnect</a>
          </div>
        </div>

        {/* Contribution stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Contributions" value={c.total_this_year} color="white" />
          <StatCard label="Commits"       value={c.total_commits} />
          <StatCard label="Pull Requests" value={c.total_prs} />
          <StatCard label="Issues"        value={c.total_issues} />
        </div>

        {/* Streak */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-5 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-3xl font-bold text-white">🔥 {c.current_streak}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Current streak (days)</div>
          </div>
          <div className="rounded-xl border p-5 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-3xl font-bold text-white">{c.longest_streak}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Longest streak (days)</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
            Contributions {new Date().getFullYear()}
          </p>
          <ContribHeatmap calendarWeeks={c.calendar_weeks} />
        </div>

        {/* Repo stats + Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Repositories</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Public" value={githubData.public_repos} />
              <StatCard label="Stars"  value={githubData.total_stars} color="#f59e0b" />
              <StatCard label="Forks"  value={githubData.total_forks} />
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Languages</p>
            {githubData.languages && githubData.languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {githubData.languages.map(({ lang, count }) => (
                  <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border" style={{ borderColor: 'var(--border)', color: 'white', backgroundColor: 'var(--surface-2)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: LANG_COLORS[lang] || '#888', display: 'inline-block' }} />
                    {lang}
                    <span style={{ color: 'var(--muted)' }}>({count})</span>
                  </span>
                ))}
              </div>
            ) : <p className="text-sm" style={{ color: 'var(--muted)' }}>No language data</p>}
          </div>
        </div>

        {/* Top Repos */}
        {githubData.top_repos?.length > 0 && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Top Repositories</p>
            </div>
            {githubData.top_repos.map((repo, i) => (
              <a
                key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] no-underline"
                style={{ borderBottom: i < githubData.top_repos.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{repo.name}</p>
                  {repo.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{repo.description}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: LANG_COLORS[repo.language] || '#888', display: 'inline-block' }} />
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stars}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {githubData.recent_activity?.length > 0 && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Recent Activity</p>
            </div>
            {githubData.recent_activity.map((event, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 text-sm"
                style={{ borderBottom: i < githubData.recent_activity.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}>
                <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}>
                  {event.type.replace('Event', '')}
                </span>
                <span className="flex-1 truncate text-xs" style={{ color: 'var(--muted)' }}>{event.repo}</span>
                <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{new Date(event.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Open PRs */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Open Pull Requests</p>
          {prsLoading && <Spinner size="sm" className="py-4" />}
          {prsError && <p className="text-red-400 text-sm">{prsError}</p>}
          {!prsLoading && !prsError && prs.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No open PRs found.</p>}
          {prs.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {prs.map((pr, i) => (
                <div key={pr.html_url} className="px-5 py-4"
                  style={{ borderBottom: i < prs.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}>
                  <a href={pr.html_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:underline">{pr.title}</a>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}>{pr.repo}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(pr.created_at).toLocaleDateString()}</span>
                    {(pr.labels || []).map(l => (
                      <span key={l} className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>{l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
