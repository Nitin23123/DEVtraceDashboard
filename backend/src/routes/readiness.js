const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { predictReadiness, getBenchmarkList } = require('../ml/readinessModel');

/**
 * Optional token verification: if token is present and valid, attaches req.user.
 * Does not reject requests without tokens (allows public simulator mode).
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET || 'devtrackr-jwt-secret-key-change-in-production', (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

// ── GET /api/placements/readiness/benchmarks ──────────────────────────────────
router.get('/benchmarks', (req, res) => {
  try {
    const list = getBenchmarkList();
    res.json(list);
  } catch (err) {
    console.error('Error in benchmarks:', err);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

// ── POST /api/placements/readiness/predict ────────────────────────────────────
router.post('/predict', optionalAuth, async (req, res) => {
  try {
    let dsaStats = {
      easy: req.body.dsa?.easy || 0,
      medium: req.body.dsa?.medium || 0,
      hard: req.body.dsa?.hard || 0,
      total: req.body.dsa?.total || 0,
      topicsCompleted: req.body.dsa?.topicsCompleted || [],
    };

    let streak = req.body.github?.currentStreak || 0;

    // If user is authenticated and didn't manually override DSA stats in request body,
    // pull their actual progress from DB
    if (req.user && (!req.body.dsa || req.body.useDbStats)) {
      try {
        const { rows: progressRows } = await query(
          `SELECT p.difficulty, p.topic, udp.completed
           FROM user_dsa_progress udp
           JOIN dsa_problems p ON p.id = udp.problem_id
           WHERE udp.user_id = $1 AND udp.completed = TRUE`,
          [req.user.id]
        );

        let easy = 0;
        let medium = 0;
        let hard = 0;
        const topics = new Set();

        progressRows.forEach((r) => {
          if (r.difficulty === 'Easy') easy++;
          else if (r.difficulty === 'Medium') medium++;
          else if (r.difficulty === 'Hard') hard++;
          if (r.topic) topics.add(r.topic);
        });

        dsaStats = {
          easy: req.body.dsa?.easy !== undefined ? req.body.dsa.easy : easy,
          medium: req.body.dsa?.medium !== undefined ? req.body.dsa.medium : medium,
          hard: req.body.dsa?.hard !== undefined ? req.body.dsa.hard : hard,
          total: easy + medium + hard,
          topicsCompleted: Array.from(topics),
        };

        const { rows: streakRows } = await query(
          `SELECT current_streak FROM streaks WHERE user_id = $1`,
          [req.user.id]
        );
        if (streakRows.length > 0 && req.body.github?.currentStreak === undefined) {
          streak = streakRows[0].current_streak || 0;
        }
      } catch (dbErr) {
        console.warn('Could not fetch user DB stats for readiness, falling back to body payload:', dbErr.message);
      }
    }

    const payload = {
      cgpa: req.body.cgpa !== undefined ? Number(req.body.cgpa) : 7.8,
      dsa: dsaStats,
      coreCs: req.body.coreCs || { dbms: 3, os: 3, networks: 3, oops: 4 },
      github: {
        reposCount: req.body.github?.reposCount !== undefined ? Number(req.body.github.reposCount) : 4,
        currentStreak: streak,
        totalContributions: req.body.github?.totalContributions || 50,
      },
      projectsCount: req.body.projectsCount !== undefined ? Number(req.body.projectsCount) : 2,
      targetCompanySlug: req.body.targetCompanySlug || 'nagarro',
    };

    const prediction = predictReadiness(payload);
    res.json(prediction);
  } catch (err) {
    console.error('Error predicting placement readiness:', err);
    res.status(500).json({ error: 'Internal error running prediction engine' });
  }
});

module.exports = router;
