/**
 * Local Tourist Day-Visit Planner and Information System
 * Rate Limiter Middleware: src/middleware/rateLimiter.js
 * Prevents brute force attacks against authentication endpoints
 * Author: Ahmed ALL (E2410186)
 */

const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // limit each IP to 15 login requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.'
  }
});

module.exports = { loginRateLimiter };
