require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check — used by Docker and plan verification
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));

const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

const notesRouter = require('./routes/notes');
app.use('/api/notes', notesRouter);

const goalsRouter = require('./routes/goals');
app.use('/api/goals', goalsRouter);

const apiTesterRouter = require('./routes/apiTester');
app.use('/api/tester', apiTesterRouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);

const { authRouter: githubAuthRouter, profileRouter: githubProfileRouter } = require('./routes/github');
app.use('/api/auth', githubAuthRouter);
app.use('/api/profile', githubProfileRouter);

// 404 fallthrough
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
