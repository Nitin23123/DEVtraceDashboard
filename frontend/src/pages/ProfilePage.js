import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
  Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

function StatBadge({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '60px' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

const ProfilePage = () => {
  const { token } = useAuth();
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGithubProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/profile/github`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 404) {
        setGithubData(null);
      } else if (!res.ok) {
        setError(data.error || 'Failed to load GitHub profile');
      } else {
        setGithubData(data);
      }
    } catch (err) {
      setError('Network error — could not reach backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('github')) {
      window.history.replaceState({}, '', '/profile');
    }
    loadGithubProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div style={{ padding: '24px' }}><h1>Profile</h1><p>Loading...</p></div>;
  }

  if (!githubData) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Profile</h1>
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px 24px' }}>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Connect your GitHub account to see your stats here.</p>
          {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
          <a
            href={`${API_URL}/api/auth/github?token=${token}`}
            style={{ display: 'inline-block', backgroundColor: '#1e293b', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
          >
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  const memberSince = githubData.created_at
    ? new Date(githubData.created_at).getFullYear()
    : null;

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '20px' }}>Profile</h1>
      {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}

      {/* Header card */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>

        {/* Avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
          <img
            src={githubData.avatar_url}
            alt="GitHub avatar"
            style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{githubData.name || githubData.login}</h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '14px' }}>@{githubData.login}</p>
            {githubData.bio && <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '14px' }}>{githubData.bio}</p>}

            {/* Meta info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
              {githubData.location && <span style={{ fontSize: '13px', color: '#64748b' }}>📍 {githubData.location}</span>}
              {githubData.company && <span style={{ fontSize: '13px', color: '#64748b' }}>🏢 {githubData.company}</span>}
              {githubData.blog && (
                <a href={githubData.blog.startsWith('http') ? githubData.blog : `https://${githubData.blog}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                  🔗 {githubData.blog}
                </a>
              )}
              {githubData.twitter_username && (
                <a href={`https://twitter.com/${githubData.twitter_username}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                  🐦 @{githubData.twitter_username}
                </a>
              )}
              {memberSince && <span style={{ fontSize: '13px', color: '#64748b' }}>📅 Member since {memberSince}</span>}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
          <StatBadge label="Repos" value={githubData.public_repos} />
          <StatBadge label="Stars" value={githubData.total_stars} />
          <StatBadge label="Forks" value={githubData.total_forks} />
          <StatBadge label="Followers" value={githubData.followers} />
          <StatBadge label="Following" value={githubData.following} />
          {githubData.public_gists > 0 && <StatBadge label="Gists" value={githubData.public_gists} />}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
          <a href={githubData.html_url} target="_blank" rel="noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            View on GitHub
          </a>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <a href={`${API_URL}/api/auth/github?token=${token}`}
            style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>
            Reconnect GitHub
          </a>
        </div>

        {/* Languages */}
        {githubData.languages && githubData.languages.length > 0 && (
          <Section title="Top Languages">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {githubData.languages.map(({ lang, count }) => (
                <span key={lang} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#374151',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LANG_COLORS[lang] || '#94a3b8', display: 'inline-block' }} />
                  {lang} <span style={{ color: '#94a3b8' }}>({count})</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Top Repositories */}
        {githubData.top_repos && githubData.top_repos.length > 0 && (
          <Section title="Top Repositories">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {githubData.top_repos.map(repo => (
                <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', transition: 'border-color 0.15s' }}
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
          </Section>
        )}

        {/* Recent Activity */}
        {githubData.recent_activity && githubData.recent_activity.length > 0 && (
          <Section title="Recent Activity">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {githubData.recent_activity.map((event, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
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
          </Section>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
