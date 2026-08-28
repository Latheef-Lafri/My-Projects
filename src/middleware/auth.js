/**
 * Local Tourist Day-Visit Planner and Information System
 * Session Authentication Middleware: src/middleware/auth.js
 * Author: Ahmed ALL (E2410186)
 */

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }

  const isApiRequest = 
    (req.originalUrl && req.originalUrl.startsWith('/api/')) ||
    (req.baseUrl && req.baseUrl.startsWith('/api')) ||
    (req.path && req.path.startsWith('/api/')) ||
    req.headers['content-type']?.includes('application/json') ||
    req.headers['accept']?.includes('application/json');

  if (isApiRequest) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Administrator session required. Please log in.'
    });
  }

  return res.redirect('/admin/login.html?session_expired=1');
}

module.exports = { requireAdmin };
