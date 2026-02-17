const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const experimentRoutes = require('./routes/experimentRoutes');
const resultRoutes = require('./routes/resultRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const suggestRoutes = require('./routes/suggestRoutes');

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Rate limiting ─────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ── API routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api', resultRoutes);
app.use('/api', uploadRoutes);
app.use('/api', suggestRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
