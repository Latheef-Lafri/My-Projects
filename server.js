/**
 * Local Tourist Day-Visit Planner and Information System
 * Main Server Entry Point: server.js
 * Author: Ahmed ALL (E2410186)
 * Course: ITE2953 Programming Group Project 25S2
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const { testConnection } = require('./database/db');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const placeRoutes = require('./src/routes/placeRoutes');
const planRoutes = require('./src/routes/planRoutes');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Configuration (FR-6.1, Security Requirements)
app.use(
  session({
    name: 'tourist_planner_sid',
    secret: process.env.SESSION_SECRET || 'tourist_planner_dev_secret_key_982349',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Admin area access protection (redirect unauthenticated access to login)
app.use('/admin', (req, res, next) => {
  // Allow login.html, static css/js for login
  if (
    req.path === '/login.html' ||
    req.path === '/login' ||
    req.path.startsWith('/admin.css') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.js')
  ) {
    return next();
  }

  if (!req.session || !req.session.admin) {
    return res.redirect('/admin/login.html');
  }

  next();
});

const uploadRoutes = require('./src/routes/uploadRoutes');

// Serve Public Static Assets and Uploads Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/Upload', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount API Endpoints
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log('================================================================');
    console.log('   LOCAL TOURIST DAY-VISIT PLANNER & INFORMATION SYSTEM        ');
    console.log('   Sammanthurai & Surrounding Areas (Within 25 km Radius)       ');
    console.log('================================================================');
    console.log(`[HTTP] Server is listening at: http://localhost:${PORT}`);
    console.log(`[PUBLIC] Main Tourism Portal:  http://localhost:${PORT}/`);
    console.log(`[ADMIN]  Admin Control Panel:  http://localhost:${PORT}/admin/login.html`);
    console.log('----------------------------------------------------------------');

    const dbCheck = await testConnection();
    if (dbCheck.success) {
      console.log(`[DB] Database Status: Connected (${dbCheck.mode})`);
    } else {
      console.log(`[DB] MySQL Notice: ${dbCheck.message || dbCheck.error}`);
      console.log('[DB] To initialize MySQL, start MySQL service and run: npm run db:init');
    }
    console.log('================================================================\n');
  });
}

module.exports = app;
