const { query } = require('../db');

async function getStats(req, res, next) {
  try {
    const userId = req.user.id;

    // ── Task counts by status ──────────────────────────────────────
    const taskResult = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM tasks
       WHERE user_id = $1
       GROUP BY status`,
      [userId]
    );

    const taskCounts = { todo: 0, in_progress: 0, done: 0 };
    for (const row of taskResult.rows) {
      taskCounts[row.status] = row.count;
    }
    taskCounts.total = taskCounts.todo + taskCounts.in_progress + taskCounts.done;

    // ── Notes count ───────────────────────────────────────────────
    const notesResult = await query(
      'SELECT COUNT(*)::int AS count FROM notes WHERE user_id = $1',
      [userId]
    );
    const notesTotal = notesResult.rows[0].count;

    // ── Goals counts ──────────────────────────────────────────────
    const goalsResult = await query(
      `SELECT COUNT(*)::int AS total,
              SUM(CASE WHEN is_completed THEN 1 ELSE 0 END)::int AS completed
       FROM goals
       WHERE user_id = $1`,
      [userId]
    );
    const goalsTotal = goalsResult.rows[0].total;
    const goalsCompleted = goalsResult.rows[0].completed || 0;

    // ── Streak upsert logic ───────────────────────────────────────
    // Get current streak row (if any)
    const streakResult = await query(
      'SELECT current_streak, longest_streak, last_active_date FROM streaks WHERE user_id = $1',
      [userId]
    );

    let currentStreak = 1;
    let longestStreak = 1;

    if (streakResult.rows.length === 0) {
      // First visit — create streak row
      await query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_active_date, updated_at)
         VALUES ($1, 1, 1, CURRENT_DATE, NOW())`,
        [userId]
      );
    } else {
      const row = streakResult.rows[0];
      const lastActive = row.last_active_date; // Date object from pg
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = new Date(lastActive);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day — no change
        currentStreak = row.current_streak;
        longestStreak = row.longest_streak;
      } else if (diffDays === 1) {
        // Consecutive day — increment
        currentStreak = row.current_streak + 1;
        longestStreak = Math.max(currentStreak, row.longest_streak);
        await query(
          `UPDATE streaks
           SET current_streak = $1, longest_streak = $2, last_active_date = CURRENT_DATE, updated_at = NOW()
           WHERE user_id = $3`,
          [currentStreak, longestStreak, userId]
        );
      } else {
        // Gap of 2+ days — reset streak to 1
        currentStreak = 1;
        longestStreak = row.longest_streak; // longest never decreases
        await query(
          `UPDATE streaks
           SET current_streak = 1, last_active_date = CURRENT_DATE, updated_at = NOW()
           WHERE user_id = $1`,
          [userId]
        );
      }
    }

    // ── Build response ────────────────────────────────────────────
    res.status(200).json({
      tasks: {
        todo: taskCounts.todo,
        in_progress: taskCounts.in_progress,
        done: taskCounts.done,
        total: taskCounts.total,
      },
      notes: { total: notesTotal },
      goals: { total: goalsTotal, completed: goalsCompleted },
      streak: { current: currentStreak, longest: longestStreak },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
