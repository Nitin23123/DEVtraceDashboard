import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    <div style={{ textAlign: 'center', minWidth: '64px' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: color || '#1e293b' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      {children}
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

  if (loading) return <div style={{ padding: '24px' }}><h1>Profile</h1><p>Loading...</p></div>;

  if (!githubData) {
    return (
      <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Profile</h1>
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px 24px' }}>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Connect your GitHub account to see your developer dashboard.</p>
          {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
          <a href={`${API_URL}/api/auth/github?token=${token}`}
            style={{ display: 'inline-block', backgroundColor: '#1e293b', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
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
    <div style={{ padding: '24px', maxWidth: '860px' }}>
      <h1 style={{ marginBottom: '20px' }}>Profile</h1>

      {/* Identity card */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <img src={githubData.avatar_url} alt="avatar"
            style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{githubData.name || githubData.login}</h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '14px' }}>@{githubData.login}</p>
            {githubData.bio && <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '14px' }}>{githubData.bio}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {githubData.location && <span style={{ fontSize: '13px', color: '#64748b' }}>📍 {githubData.location}</span>}
              {githubData.company && <span style={{ fontSize: '13px', color: '#64748b' }}>🏢 {githubData.company}</span>}
              {githubData.blog && (
                <a href={githubData.blog.startsWith('http') ? githubData.blog : `https://${githubData.blog}`}
                  target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                  🔗 {githubData.blog}
                </a>
              )}
              {githubData.twitter_username && (
                <a href={`https://twitter.com/${githubData.twitter_username}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                  🐦 @{githubData.twitter_username}
                </a>
              )}
              {memberSince && <span style={{ fontSize: '13px', color: '#64748b' }}>📅 Since {memberSince}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <a href={githubData.html_url} target="_blank" rel="noreferrer"
              style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>View on GitHub</a>
            <a href={`${API_URL}/api/auth/github?token=${token}`}
              style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Reconnect</a>
          </div>
        </div>
      </div>

      {/* Contribution Dashboard */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>Contribution Dashboard <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>{new Date().getFullYear()}</span></h2>

        {/* Key stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, backgroundColor: '#1e293b', color: 'white', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>🔥 {c.current_streak}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Current Streak (days)</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{c.longest_streak}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Longest Streak (days)</div>
          </div>
        </div>

        {/* Heatmap */}
        <ContribHeatmap calendarWeeks={c.calendar_weeks} />
      </div>

      {/* Profile stats + languages side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Repo stats */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Repository Stats</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <StatBadge label="Repos" value={githubData.public_repos} />
            <StatBadge label="Stars" value={githubData.total_stars} color="#f59e0b" />
            <StatBadge label="Forks" value={githubData.total_forks} />
            <StatBadge label="Followers" value={githubData.followers} />
            <StatBadge label="Following" value={githubData.following} />
            {githubData.public_gists > 0 && <StatBadge label="Gists" value={githubData.public_gists} />}
          </div>
        </div>

        {/* Languages */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Languages</h3>
          {githubData.languages && githubData.languages.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {githubData.languages.map(({ lang, count }) => (
                <span key={lang} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3px 9px', fontSize: '12px', color: '#374151' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LANG_COLORS[lang] || '#94a3b8', display: 'inline-block' }} />
                  {lang} <span style={{ color: '#94a3b8' }}>({count})</span>
                </span>
              ))}
            </div>
          ) : <p style={{ color: '#94a3b8', fontSize: '13px' }}>No language data</p>}
        </div>
      </div>

      {/* Top Repositories */}
      {githubData.top_repos && githubData.top_repos.length > 0 && (
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Repositories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {githubData.top_repos.map(repo => (
              <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#3b82f6' }}>{repo.name}</span>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                      {repo.language && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LANG_COLORS[repo.language] || '#94a3b8', display: 'inline-block' }} />
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </div>
                  {repo.description && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {githubData.recent_activity.map((event, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#f1f5f9', borderRadius: '4px', padding: '1px 6px', fontSize: '11px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                  {event.type.replace('Event', '')}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.repo}</span>
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '11px' }}>
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Open Pull Requests */}
      <div style={{ marginTop: 0 }}>
        <h3 style={{ color: '#1e293b', marginBottom: 12, fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Pull Requests</h3>
        {prsLoading && <p style={{ color: '#64748b' }}>Loading PRs...</p>}
        {prsError && <p style={{ color: '#ef4444' }}>{prsError}</p>}
        {!prsLoading && !prsError && prs.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No open PRs found.</p>
        )}
        {prs.map(pr => (
          <div key={pr.html_url} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
            <a href={pr.html_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              {pr.title}
            </a>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: '#334155', color: '#94a3b8', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{pr.repo}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(pr.created_at).toLocaleDateString()}</span>
              {(pr.labels || []).map(l => (
                <span key={l} style={{ background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
