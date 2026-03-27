const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// ── authRouter — mounted at /api/auth ────────────────────────────────────────
// Handles: GET /api/auth/github  and  GET /api/auth/github/callback

const authRouter = express.Router();

// GET /api/auth/github?token=<jwt>
// The frontend passes the JWT as a query param. We encode it as base64 state
// so the callback knows which user to update after GitHub redirects back.
authRouter.get('/github', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'token query param is required' });
  }
  const state = Buffer.from(token).toString('base64');
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'read:user,public_repo',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// GET /api/auth/github/callback?code=xxx&state=xxx
// GitHub redirects here. No verifyToken — user identity comes from state param.
authRouter.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.redirect('http://localhost:3000/profile?github=error&reason=missing_params');
  }

  // Decode state to recover the JWT and identify the user
  let userId;
  try {
    const rawJwt = Buffer.from(state, 'base64').toString('utf8');
    const decoded = jwt.verify(rawJwt, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    return res.redirect('http://localhost:3000/profile?github=error&reason=invalid_state');
  }

  // Exchange the code for an access token
  let accessToken;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return res.redirect('http://localhost:3000/profile?github=error&reason=token_exchange_failed');
    }
    accessToken = tokenData.access_token;
  } catch (err) {
    console.error('GitHub token exchange fetch error:', err);
    return res.redirect('http://localhost:3000/profile?github=error&reason=fetch_failed');
  }

  // Fetch GitHub username using the new access token
  let githubUsername;
  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'devtrackr',
      },
    });
    const userData = await userRes.json();
    if (!userData.login) {
      return res.redirect('http://localhost:3000/profile?github=error&reason=no_login_field');
    }
    githubUsername = userData.login;
  } catch (err) {
    console.error('GitHub user fetch error:', err);
    return res.redirect('http://localhost:3000/profile?github=error&reason=user_fetch_failed');
  }

  // Persist token and username to the users table
  try {
    await pool.query(
      'UPDATE users SET github_access_token = $1, github_username = $2, updated_at = NOW() WHERE id = $3',
      [accessToken, githubUsername, userId]
    );
  } catch (err) {
    console.error('DB update error:', err);
    return res.redirect('http://localhost:3000/profile?github=error&reason=db_error');
  }

  res.redirect('http://localhost:3000/profile?github=connected');
});

// ── profileRouter — mounted at /api/profile ───────────────────────────────────
// Handles: GET /api/profile/github

const profileRouter = express.Router();

// GET /api/profile/github
// Reads stored github_access_token from DB, fetches live data from GitHub API,
// returns the structured profile JSON.
profileRouter.get('/github', verifyToken, async (req, res) => {
  try {
    const dbRes = await pool.query(
      'SELECT github_access_token, github_username FROM users WHERE id = $1',
      [req.user.id]
    );
    const row = dbRes.rows[0];

    if (!row || !row.github_access_token) {
      return res.status(404).json({ error: 'GitHub account not connected' });
    }

    const ghToken = row.github_access_token;
    const ghUsername = row.github_username;
    const ghHeaders = {
      'Authorization': `token ${ghToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'devtrackr',
    };

    // Fetch profile, repos (for star count), and recent events in parallel
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers: ghHeaders }),
      fetch('https://api.github.com/user/repos?per_page=100&type=owner', { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${ghUsername}/events?per_page=5`, { headers: ghHeaders }),
    ]);

    const [profile, repos, events] = await Promise.all([
      profileRes.json(),
      reposRes.json(),
      eventsRes.json(),
    ]);

    // Sum stargazers_count across all owned repos
    const totalStars = Array.isArray(repos)
      ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
      : 0;

    // Shape recent activity (at most 5 events)
    const recentActivity = Array.isArray(events)
      ? events.slice(0, 5).map(e => ({
          type: e.type,
          repo: e.repo ? e.repo.name : '',
          created_at: e.created_at,
        }))
      : [];

    res.json({
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      public_repos: profile.public_repos,
      total_stars: totalStars,
      followers: profile.followers,
      following: profile.following,
      html_url: profile.html_url,
      recent_activity: recentActivity,
    });
  } catch (err) {
    console.error('GitHub profile route error:', err);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

module.exports = { authRouter, profileRouter };
