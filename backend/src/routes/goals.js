const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getGoals, createGoal, updateGoal, deleteGoal, completeGoal } = require('../controllers/goalsController');

router.get('/',             verifyToken, getGoals);
router.post('/',            verifyToken, createGoal);
router.put('/:id/complete', verifyToken, completeGoal);  // MUST come before /:id
router.put('/:id',          verifyToken, updateGoal);
router.delete('/:id',       verifyToken, deleteGoal);

module.exports = router;
