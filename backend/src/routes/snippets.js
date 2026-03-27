const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { query } = require('../db');

// GET /api/snippets — list all snippets for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM snippets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/snippets — create a new snippet
router.post('/', verifyToken, async (req, res) => {
  const { title, language, content } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'content is required' });
  }

  const lang = language && typeof language === 'string' ? language : 'Other';

  try {
    const { rows } = await query(
      'INSERT INTO snippets (user_id, title, language, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title.trim(), lang, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/snippets/:id — update a snippet owned by the requesting user
router.put('/:id', verifyToken, async (req, res) => {
  const { title, language, content } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'content is required' });
  }

  const lang = language && typeof language === 'string' ? language : 'Other';

  try {
    const { rows, rowCount } = await query(
      `UPDATE snippets
       SET title = $1, language = $2, content = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title.trim(), lang, content, req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Snippet not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/snippets/:id — delete a snippet owned by the requesting user
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM snippets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Snippet not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
