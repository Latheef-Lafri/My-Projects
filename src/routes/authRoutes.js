/**
 * Local Tourist Day-Visit Planner and Information System
 * Authentication Routes: src/routes/authRoutes.js
 * Implements FR-6.1, FR-6.2, FR-6.3
 * Author: Ahmed ALL (E2410186)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const AdminModel = require('../models/adminModel');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login - Administrator login (FR-6.1, FR-6.2)
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const admin = await AdminModel.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please try again.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please try again.'
      });
    }

    // Set session data
    req.session.admin = {
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout - Administrator logout (FR-6.3)
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to terminate session.'
      });
    }
    res.clearCookie('connect.sid');
    return res.json({
      success: true,
      message: 'Administrator logged out successfully.'
    });
  });
});

// GET /api/auth/me - Verify current session status
router.get('/me', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({
      authenticated: true,
      admin: req.session.admin
    });
  }
  return res.json({
    authenticated: false,
    admin: null
  });
});

module.exports = router;
