import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        // Not connected yet — this is expected, not an error
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
    // Strip ?github=connected from URL without reload
    const params = new URLSearchParams(window.location.search);
    if (params.has('github')) {
      window.history.replaceState({}, '', '/profile');
    }
    loadGithubProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- render ---
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Profile</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!githubData) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Profile</h1>
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px 24px' }}>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Connect your GitHub account to see your stats here.
          </p>
          {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
          <a
            href={`http://localhost:5000/api/auth/github?token=${token}`}
            style={{
              display: 'inline-block',
              backgroundColor: '#1e293b',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Profile</h1>
      {error && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <img
            src={githubData.avatar_url}
            alt="GitHub avatar"
            style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #e2e8f0' }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{githubData.name || githubData.login}</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>@{githubData.login}</p>
            {githubData.bio && (
              <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '14px' }}>{githubData.bio}</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Repos', value: githubData.public_repos },
            { label: 'Stars', value: githubData.total_stars },
            { label: 'Followers', value: githubData.followers },
            { label: 'Following', value: githubData.following },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <a
            href={githubData.html_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}
          >
            View on GitHub
          </a>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <a
            href={`http://localhost:5000/api/auth/github?token=${token}`}
            style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}
          >
            Reconnect GitHub
          </a>
        </div>

        {Array.isArray(githubData.recent_activity) && githubData.recent_activity.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#374151' }}>Recent Activity</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {githubData.recent_activity.map((event, i) => (
                <li
                  key={i}
                  style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}
                >
                  <span style={{ fontWeight: 600 }}>{event.type}</span>
                  <span>—</span>
                  <span>{event.repo}</span>
                  <span style={{ color: '#94a3b8' }}>
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
