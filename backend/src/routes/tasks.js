const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { query } = require('../db');
const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/tasksController');

router.get('/',       verifyToken, getTasks);
router.post('/',      verifyToken, createTask);
router.get('/:id',    verifyToken, getTask);

// PUT /:id/pin — toggle pinned column (must be declared before /:id to avoid route shadowing)
router.put('/:id/pin', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE tasks
       SET pinned = NOT pinned, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id',    verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
