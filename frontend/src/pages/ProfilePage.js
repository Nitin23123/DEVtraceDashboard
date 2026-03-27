import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
  Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

const CONTRIB_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
function contribColor(count) {
  if (count === 0) return CONTRIB_COLORS[0];
  if (count <= 3) return CONTRIB_COLORS[1];
  if (count <= 6) return CONTRIB_COLORS[2];
  if (count <= 9) return CONTRIB_COLORS[3];
  return CONTRIB_COLORS[4];
}

function StatBadge({ label, value, sub, color }) {
  return (
    <div className="text-center min-w-[64px]">
      <div className="text-2xl font-bold" style={{ color: color || 'var(--text)' }}>{value ?? '—'}</div>
      <div className="text-xs text-text/60 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-text/40">{sub}</div>}
    </div>
  );
}

function ContribHeatmap({ calendarWeeks }) {
  if (!calendarWeeks || calendarWeeks.length === 0) return null;
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  // Show month labels at approximate week positions
  const monthLabels = [];
  calendarWeeks.forEach((week, wi) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getDate() <= 7) {
        monthLabels.push({ wi, label: d.toLocaleString('default', { month: 'short' }) });
      }
    }
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginLeft: '24px', marginBottom: '2px', position: 'relative', height: '14px' }}>
        {monthLabels.map(({ wi, label }) => (
          <div key={wi} style={{
            position: 'absolute', left: wi * 12, fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap',
          }}>{label}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0' }}>
        {/* Day-of-week labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px', paddingTop: '0' }}>
          {DAY_LABELS.map((l, i) => (
            <div key={i} style={{ height: '10px', fontSize: '9px', color: '#94a3b8', lineHeight: '10px', width: '20px', textAlign: 'right' }}>{l}</div>
          ))}
        </div>
        {/* Heatmap grid */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {calendarWeeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {week.contributionDays.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`}
                  style={{
                    width: 10, height: 10, borderRadius: 2,
                    backgroundColor: contribColor(day.contributionCount),
                    cursor: 'default',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Less</span>
        {CONTRIB_COLORS.map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
        ))}
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>More</span>
      </div>
    </div>
  );
}

const ProfilePage = () => {
  const { token } = useAuth();
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prs, setPrs] = useState([]);
  const [prsLoading, setPrsLoading] = useState(false);
  const [prsError, setPrsError] = useState(null);

  const loadGithubProfile = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/profile/github`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 404) setGithubData(null);
      else if (!res.ok) setError(data.error || 'Failed to load GitHub profile');
      else setGithubData(data);
    } catch {
      setError('Network error — could not reach backend');
    } finally {
      setLoading(false);
    }
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
      .then(data => {
        if (Array.isArray(data)) setPrs(data);
        else setPrsError(data.error || 'Failed to load PRs');
      })
      .catch(() => setPrsError('Network error'))
      .finally(() => setPrsLoading(false));
  }, [githubData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text mb-6">Profile</h1>
        <Spinner size="lg" className="mt-16" />
      </div>
    );
  }

  if (!githubData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-6">Profile</h1>
        <div className="bg-surface border border-border rounded-2xl p-12 text-center max-w-sm mx-auto mt-8">
          <p className="text-text/60 mb-6">Connect your GitHub account to see your developer dashboard.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <a
            href={`${API_URL}/api/auth/github?token=${token}`}
            className="inline-block bg-accent text-accent-fg px-6 py-2.5 rounded-lg font-semibold hover:opacity-80 transition-opacity no-underline"
          >
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  const c = githubData.contributions || {};
  const memberSince = githubData.created_at ? new Date(githubData.created_at).getFullYear() : null;
  const weekTrend = c.this_week > c.last_week ? '↑' : c.this_week < c.last_week ? '↓' : '→';
  const weekTrendColor = c.this_week > c.last_week ? '#10b981' : c.this_week < c.last_week ? '#ef4444' : '#64748b';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-5">Profile</h1>

      {/* Identity card */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start gap-5">
          <img
            src={githubData.avatar_url}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text">{githubData.name || githubData.login}</h2>
            <p className="text-sm text-text/60 mt-0.5">@{githubData.login}</p>
            {githubData.bio && <p className="text-sm text-text/70 mt-1">{githubData.bio}</p>}
            <div className="flex flex-wrap gap-2.5 mt-2">
              {githubData.location && <span className="text-sm text-text/60">📍 {githubData.location}</span>}
              {githubData.company && <span className="text-sm text-text/60">🏢 {githubData.company}</span>}
              {githubData.blog && (
                <a
                  href={githubData.blog.startsWith('http') ? githubData.blog : `https://${githubData.blog}`}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  🔗 {githubData.blog}
                </a>
              )}
              {githubData.twitter_username && (
                <a
                  href={`https://twitter.com/${githubData.twitter_username}`}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  🐦 @{githubData.twitter_username}
                </a>
              )}
              {memberSince && <span className="text-sm text-text/60">📅 Since {memberSince}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <a
              href={githubData.html_url}
              target="_blank" rel="noreferrer"
              className="text-sm text-blue-500 font-medium hover:underline"
            >
              View on GitHub
            </a>
            <a
              href={`${API_URL}/api/auth/github?token=${token}`}
              className="text-xs text-text/40 hover:underline"
            >
              Reconnect
            </a>
          </div>
        </div>
      </div>

      {/* Contribution Dashboard */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <h2 className="text-base font-semibold text-text mb-4">
          Contribution Dashboard{' '}
          <span className="text-xs text-text/40 font-normal">{new Date().getFullYear()}</span>
        </h2>

        {/* Key stats */}
        <div className="bg-bg rounded-lg p-4 flex flex-wrap gap-4 mb-5">
          <StatBadge label="Total Contributions" value={c.total_this_year} color="#3b82f6" />
          <StatBadge label="Commits" value={c.total_commits} />
          <StatBadge label="Pull Requests" value={c.total_prs} />
          <StatBadge label="Issues" value={c.total_issues} />
          <StatBadge label="PRs Merged" value={githubData.prs_merged} color="#10b981" />
          <StatBadge label="PRs Open" value={githubData.prs_open} color="#f59e0b" />
          <StatBadge
            label="This Week"
            value={c.this_week}
            sub={<span style={{ color: weekTrendColor }}>{weekTrend} vs {c.last_week} last wk</span>}
          />
        </div>

        {/* Streak stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-slate-900 text-white rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">🔥 {c.current_streak}</div>
            <div className="text-xs text-slate-400 mt-1">Current Streak (days)</div>
          </div>
          <div className="flex-1 bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-text">{c.longest_streak}</div>
            <div className="text-xs text-text/60 mt-1">Longest Streak (days)</div>
          </div>
        </div>

        {/* Heatmap */}
        <ContribHeatmap calendarWeeks={c.calendar_weeks} />
      </div>

      {/* Profile stats + languages side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Repo stats */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-3">Repository Stats</h3>
          <div className="flex flex-wrap gap-4">
            <StatBadge label="Repos" value={githubData.public_repos} />
            <StatBadge label="Stars" value={githubData.total_stars} color="#f59e0b" />
            <StatBadge label="Forks" value={githubData.total_forks} />
            <StatBadge label="Followers" value={githubData.followers} />
            <StatBadge label="Following" value={githubData.following} />
            {githubData.public_gists > 0 && <StatBadge label="Gists" value={githubData.public_gists} />}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-3">Top Languages</h3>
          {githubData.languages && githubData.languages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {githubData.languages.map(({ lang, count }) => (
                <span key={lang} className="inline-flex items-center gap-1 bg-bg border border-border rounded-full px-3 py-1 text-xs text-text">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LANG_COLORS[lang] || '#94a3b8', display: 'inline-block' }} />
                  {lang} <span className="text-text/40">({count})</span>
                </span>
              ))}
            </div>
          ) : <p className="text-text/40 text-sm">No language data</p>}
        </div>
      </div>

      {/* Top Repositories */}
      {githubData.top_repos && githubData.top_repos.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-3">Top Repositories</h3>
          <div className="flex flex-col gap-2">
            {githubData.top_repos.map(repo => (
              <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" className="no-underline">
                <div className="border border-border rounded-lg px-4 py-3 hover:border-blue-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-blue-500">{repo.name}</span>
                    <div className="flex gap-2.5 text-xs text-text/60">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LANG_COLORS[repo.language] || '#94a3b8', display: 'inline-block' }} />
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-text/60 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {repo.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {githubData.recent_activity && githubData.recent_activity.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-3">Recent Activity</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
            {githubData.recent_activity.map((event, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-text/70">
                <span className="bg-bg border border-border rounded px-1.5 py-0.5 text-xs font-semibold text-text/60 whitespace-nowrap">
                  {event.type.replace('Event', '')}
                </span>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{event.repo}</span>
                <span className="text-text/40 whitespace-nowrap text-xs">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Open Pull Requests */}
      <div>
        <h3 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-3">Open Pull Requests</h3>
        {prsLoading && <Spinner size="sm" className="py-4" />}
        {prsError && <p className="text-red-500 text-sm">{prsError}</p>}
        {!prsLoading && !prsError && prs.length === 0 && (
          <p className="text-text/40 text-sm">No open PRs found.</p>
        )}
        {prs.map(pr => (
          <div key={pr.html_url} className="bg-surface border border-border rounded-lg px-4 py-3 mb-3">
            <a href={pr.html_url} target="_blank" rel="noreferrer" className="text-accent font-semibold no-underline hover:underline">
              {pr.title}
            </a>
            <div className="mt-1.5 flex gap-2 flex-wrap items-center">
              <span className="bg-border/60 text-text/60 px-2 py-0.5 rounded-full text-xs">{pr.repo}</span>
              <span className="text-xs text-text/40">{new Date(pr.created_at).toLocaleDateString()}</span>
              {(pr.labels || []).map(l => (
                <span key={l} className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs">{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
