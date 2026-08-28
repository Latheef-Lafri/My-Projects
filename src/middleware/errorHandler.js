/**
 * Local Tourist Day-Visit Planner and Information System
 * Centralized Error Handler Middleware: src/middleware/errorHandler.js
 * Author: Ahmed ALL (E2410186)
 */

function errorHandler(err, req, res, next) {
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // MySQL specific error translation
  let clientMessage = err.message || 'An unexpected internal server error occurred.';
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    clientMessage = 'Cannot delete or update this record because it is referenced by other items.';
  } else if (err.code === 'ER_DUP_ENTRY') {
    clientMessage = 'A record with this unique identifier or name already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.path} not found.`
    });
  }
  res.status(404).sendFile('404.html', { root: './public' }, (err) => {
    if (err) {
      res.status(404).send('<h1>404 Not Found</h1><p>The requested page was not found.</p><a href="/">Return Home</a>');
    }
  });
}

module.exports = { errorHandler, notFoundHandler };
