const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { query } = require('../db');

// GET /api/dsa/problems — return all problems grouped by day with per-user completion status
router.get('/problems', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT
         p.id, p.day_number, p.topic, p.title, p.difficulty,
         COALESCE(udp.completed, FALSE) AS completed
       FROM dsa_problems p
       LEFT JOIN user_dsa_progress udp
         ON udp.problem_id = p.id AND udp.user_id = $1
       ORDER BY p.day_number, p.id`,
      [req.user.id]
    );

    // Group flat rows into days
    const days = {};
    rows.forEach(row => {
      if (!days[row.day_number]) {
        days[row.day_number] = { day_number: row.day_number, topic: row.topic, problems: [] };
      }
      days[row.day_number].problems.push({
        id: row.id,
        title: row.title,
        difficulty: row.difficulty,
        completed: row.completed,
      });
    });

    res.json(Object.values(days));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/dsa/progress/:problem_id — toggle completed state for a problem
router.post('/progress/:problem_id', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      `INSERT INTO user_dsa_progress (user_id, problem_id, completed, completed_at)
       VALUES ($1, $2, TRUE, NOW())
       ON CONFLICT (user_id, problem_id)
       DO UPDATE SET
         completed = NOT user_dsa_progress.completed,
         completed_at = CASE WHEN NOT user_dsa_progress.completed THEN NOW() ELSE NULL END
       RETURNING completed`,
      [req.user.id, req.params.problem_id]
    );
    res.json({ completed: rows[0].completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
