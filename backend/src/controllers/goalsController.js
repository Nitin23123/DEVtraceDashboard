const { query } = require('../db');

const getGoals = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json({ goals: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, description, target_date } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await query(
      `INSERT INTO goals (user_id, title, description, target_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, title, description || null, target_date || null]
    );
    res.status(201).json({ goal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { title, description, target_date } = req.body;
    const { id } = req.params;
    const result = await query(
      `UPDATE goals
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           target_date = COALESCE($3, target_date),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title || null, description || null, target_date || null, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ goal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const completeGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE goals SET is_completed = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ goal: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ message: 'Goal deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, completeGoal };
