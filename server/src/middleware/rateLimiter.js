const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 200 requests per 15 minutes per IP.
 * SSE progress endpoints are excluded (they are long-lived connections,
 * not discrete requests, and would unfairly consume the budget).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip the SSE progress endpoint — it keeps a persistent connection open
  // and the heartbeat pings would eat through the rate-limit budget.
  skip: (req) => req.path.endsWith('/progress'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * Stricter limiter for auth mutation endpoints (login / register only).
 * Raised to 30 requests per 15 minutes to accommodate shared IPs on
 * hosted environments (e.g. Render free tier) without opening the door
 * to brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

module.exports = { apiLimiter, authLimiter };
