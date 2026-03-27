const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/tasksController');

router.get('/',       verifyToken, getTasks);
router.post('/',      verifyToken, createTask);
router.get('/:id',    verifyToken, getTask);
router.put('/:id',    verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
