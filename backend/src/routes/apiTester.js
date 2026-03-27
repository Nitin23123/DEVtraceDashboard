const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { proxyRequest, getHistory } = require('../controllers/apiTesterController');

router.post('/proxy',   verifyToken, proxyRequest);
router.get('/history',  verifyToken, getHistory);

module.exports = router;
