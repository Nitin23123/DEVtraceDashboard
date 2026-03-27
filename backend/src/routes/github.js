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

    // GraphQL query for contribution calendar + stats (this year)
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const yearEnd = now.toISOString();
    const graphqlQuery = {
      query: `query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }`,
      variables: { username: ghUsername, from: yearStart, to: yearEnd },
    };

    // Fetch everything in parallel
    const [profileRes, reposRes, eventsRes, contribRes, prsMergedRes, prsOpenRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers: ghHeaders }),
      fetch('https://api.github.com/user/repos?per_page=100&type=owner', { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${ghUsername}/events?per_page=10`, { headers: ghHeaders }),
      fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { ...ghHeaders, 'Authorization': `bearer ${ghToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(graphqlQuery),
      }),
      fetch(`https://api.github.com/search/issues?q=author:${ghUsername}+type:pr+is:merged&per_page=1`, { headers: ghHeaders }),
      fetch(`https://api.github.com/search/issues?q=author:${ghUsername}+type:pr+is:open&per_page=1`, { headers: ghHeaders }),
    ]);

    const [profile, repos, events, contribData, prsMergedData, prsOpenData] = await Promise.all([
      profileRes.json(),
      reposRes.json(),
      eventsRes.json(),
      contribRes.json(),
      prsMergedRes.json(),
      prsOpenRes.json(),
    ]);

    const repoList = Array.isArray(repos) ? repos : [];

    // Aggregate stats from repos
    const totalStars = repoList.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repoList.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    // Top 5 repos by stars
    const topRepos = repoList
      .filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
      }));

    // Most used languages (by repo count, excluding null)
    const langCount = {};
    repoList.filter(r => !r.fork && r.language).forEach(r => {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const languages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang, count]) => ({ lang, count }));

    // Shape recent activity (at most 10 events)
    const recentActivity = Array.isArray(events)
      ? events.slice(0, 10).map(e => ({
          type: e.type,
          repo: e.repo ? e.repo.name : '',
          created_at: e.created_at,
        }))
      : [];

    // Process contribution calendar
    const contributions = contribData.data?.user?.contributionsCollection;
    const calendarWeeks = contributions?.contributionCalendar?.weeks || [];
    const allDays = calendarWeeks.flatMap(w => w.contributionDays);

    // Compute current streak (consecutive days with commits, ending today or yesterday)
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const reverseDays = [...allDays].reverse();
    let currentStreak = 0;
    let streakStarted = false;
    for (const day of reverseDays) {
      if (!streakStarted) {
        if (day.date === todayStr || day.date === yesterdayStr) {
          if (day.contributionCount > 0) { streakStarted = true; currentStreak = 1; }
          else if (day.date === todayStr) continue; // no commits today, check yesterday
          else break;
        }
      } else {
        if (day.contributionCount > 0) currentStreak++;
        else break;
      }
    }

    // Compute longest streak this year
    let longestStreak = 0, tempStreak = 0;
    for (const day of allDays) {
      if (day.contributionCount > 0) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
      else tempStreak = 0;
    }

    // This week vs last week commits
    const thisWeekCommits = allDays.slice(-7).reduce((s, d) => s + d.contributionCount, 0);
    const lastWeekCommits = allDays.slice(-14, -7).reduce((s, d) => s + d.contributionCount, 0);

    res.json({
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      company: profile.company,
      blog: profile.blog,
      twitter_username: profile.twitter_username,
      public_repos: profile.public_repos,
      public_gists: profile.public_gists,
      total_stars: totalStars,
      total_forks: totalForks,
      followers: profile.followers,
      following: profile.following,
      html_url: profile.html_url,
      created_at: profile.created_at,
      top_repos: topRepos,
      languages,
      recent_activity: recentActivity,
      // Contribution dashboard
      contributions: {
        total_this_year: contributions?.contributionCalendar?.totalContributions || 0,
        total_commits: contributions?.totalCommitContributions || 0,
        total_prs: contributions?.totalPullRequestContributions || 0,
        total_issues: contributions?.totalIssueContributions || 0,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        this_week: thisWeekCommits,
        last_week: lastWeekCommits,
        calendar_weeks: calendarWeeks,
      },
      prs_merged: prsMergedData.total_count || 0,
      prs_open: prsOpenData.total_count || 0,
    });
  } catch (err) {
    console.error('GitHub profile route error:', err);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

module.exports = { authRouter, profileRouter };
