/**
 * Local Tourist Day-Visit Planner and Information System
 * Public Configuration Route: src/routes/configRoutes.js
 * Author: Ahmed ALL (E2410186)
 */

const express = require('express');
const router = express.Router();
const { testConnection } = require('../../database/db');

router.get('/', async (req, res) => {
  const dbStatus = await testConnection();

  return res.json({
    success: true,
    app_name: 'Local Tourist Day-Visit Planner and Information System',
    region: 'Sammanthurai, Sri Lanka',
    radius_km: 25.0,
    center_coordinates: {
      latitude: 7.3620,
      longitude: 81.8037,
      label: 'Sammanthurai Town Center'
    },
    google_maps_configured: Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY.trim()),
    google_maps_api_key: process.env.GOOGLE_MAPS_API_KEY ? process.env.GOOGLE_MAPS_API_KEY.trim() : null,
    database_status: {
      connected: dbStatus.success,
      mode: dbStatus.mode || 'unknown'
    }
  });
});

module.exports = router;
