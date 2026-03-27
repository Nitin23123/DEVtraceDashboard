const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getNotes, createNote, getNote, updateNote, deleteNote } = require('../controllers/notesController');

router.get('/',     verifyToken, getNotes);
router.post('/',    verifyToken, createNote);
router.get('/:id',  verifyToken, getNote);
router.put('/:id',  verifyToken, updateNote);
router.delete('/:id', verifyToken, deleteNote);

module.exports = router;
