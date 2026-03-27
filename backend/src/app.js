require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check — used by Docker and plan verification
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes are mounted in plan 01-03
// app.use('/api/auth', require('./routes/auth'));

module.exports = app;
