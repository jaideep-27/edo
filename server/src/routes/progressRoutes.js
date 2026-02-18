const { Router } = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const progressEmitter = require('../services/progressEmitter');

const router = Router();

/**
 * GET /api/experiments/:id/progress
 *
 * Server-Sent Events endpoint for real-time optimizer progress.
 * Auth via query param: ?token=<jwt>
 * (SSE / EventSource doesn't support custom headers)
 */
router.get('/experiments/:id/progress', async (req, res) => {
  const { id } = req.params;
  const token = req.query.token;

  // Authenticate via query-string token
  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Token required' } });
  }

  try {
    jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering
  });

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected', experimentId: id })}\n\n`);

  // Listen for progress events
  const eventName = `progress:${id}`;
  const onProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  progressEmitter.on(eventName, onProgress);

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  // Cleanup on disconnect
  req.on('close', () => {
    progressEmitter.off(eventName, onProgress);
    clearInterval(heartbeat);
  });
});

module.exports = router;
