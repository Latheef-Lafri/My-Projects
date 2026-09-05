/**
 * Local Tourist Day-Visit Planner and Information System
 * Visit Plan Routes: src/routes/planRoutes.js
 * Implements FR-5.1, FR-5.2, FR-5.3, FR-5.4
 * Author: Ahmed ALL (E2410186)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PlanModel = require('../models/planModel');

// POST /api/plans - Save or Share an Ordered One-Day Visit Plan
router.post('/', async (req, res, next) => {
  try {
    const { plan_id, plan_name, place_ids } = req.body;

    if (!Array.isArray(place_ids) || place_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A visit plan must contain at least one tourist attraction.'
      });
    }

    // Generate unique plan ID if not provided
    const finalPlanId = plan_id || 'plan_' + crypto.randomBytes(6).toString('hex');
    const finalPlanName = (plan_name && plan_name.trim()) || 'One-Day Visit Plan';

    const savedPlan = await PlanModel.savePlan(finalPlanId, finalPlanName, place_ids);

    return res.status(201).json({
      success: true,
      message: 'One-day visit plan saved successfully.',
      data: savedPlan
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/:id - Retrieve a Saved Visit Plan
router.get('/:id', async (req, res, next) => {
  try {
    const plan = await PlanModel.getPlanById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Visit plan not found.'
      });
    }

    return res.json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
