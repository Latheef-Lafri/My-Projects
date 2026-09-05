/**
 * Local Tourist Day-Visit Planner and Information System
 * Tourist Place Routes: src/routes/placeRoutes.js
 * Implements FR-1.1, FR-1.2, FR-1.3, FR-2.1, FR-2.2, FR-2.3,
 * FR-3.1, FR-3.2, FR-3.3, FR-4.1, FR-4.2, FR-7.1, FR-7.2, FR-7.3, FR-7.4
 * Author: Ahmed ALL (E2410186)
 */

const express = require('express');
const router = express.Router();
const PlaceModel = require('../models/placeModel');
const CategoryModel = require('../models/categoryModel');
const { requireAdmin } = require('../middleware/auth');

// Validation helper for tourist places (FR-7.4)
function validatePlaceInput(data) {
  const errors = [];
  const {
    place_name,
    category_id,
    description,
    location,
    distance_km,
    opening_time,
    closing_time,
    estimated_duration_minutes,
    latitude,
    longitude
  } = data;

  if (!place_name || !place_name.trim()) {
    errors.push('Place name is required.');
  }

  if (!category_id || isNaN(parseInt(category_id, 10))) {
    errors.push('A valid category must be selected.');
  }

  if (!description || !description.trim()) {
    errors.push('Description is required.');
  }

  if (!location || !location.trim()) {
    errors.push('Location / address is required.');
  }

  if (distance_km === undefined || distance_km === '' || isNaN(parseFloat(distance_km))) {
    errors.push('Approximate distance in kilometers is required.');
  } else {
    const dist = parseFloat(distance_km);
    if (dist < 0) {
      errors.push('Distance cannot be negative.');
    } else if (dist > 25.0) {
      errors.push('Distance exceeds the 25 km project radius limit from Sammanthurai.');
    }
  }

  if (estimated_duration_minutes !== undefined && estimated_duration_minutes !== '') {
    const dur = parseInt(estimated_duration_minutes, 10);
    if (isNaN(dur) || dur <= 0) {
      errors.push('Estimated visit duration must be a positive integer in minutes.');
    }
  }

  if (latitude !== undefined && latitude !== '' && latitude !== null) {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be a valid coordinate between -90 and 90.');
    }
  }

  if (longitude !== undefined && longitude !== '' && longitude !== null) {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be a valid coordinate between -180 and 180.');
    }
  }

  return errors;
}

// GET /api/places/stats - General statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await PlaceModel.getStats();
    return res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/places - Browse, Search, and Filter Tourist Places
// Implements FR-1.1, FR-1.2, FR-1.3, FR-2.1, FR-2.2, FR-2.3
router.get('/', async (req, res, next) => {
  try {
    const { search, category, sortBy, sortOrder } = req.query;

    const places = await PlaceModel.getAll({
      search,
      category_id: category,
      sortBy,
      sortOrder
    });

    return res.json({
      success: true,
      count: places.length,
      data: places,
      filters: {
        search: search || null,
        category: category || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/places/:id - Single Attraction Details (FR-3.1, FR-3.2, FR-3.3, FR-4.1)
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const place = await PlaceModel.findById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `Tourist attraction with ID ${id} was not found.`
      });
    }

    return res.json({
      success: true,
      data: place
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/places - Protected: Add New Tourist Place (FR-7.1, FR-7.4)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const validationErrors = validatePlaceInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors: validationErrors
      });
    }

    // Verify category exists
    const categoryId = parseInt(req.body.category_id, 10);
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Selected category ID ${categoryId} does not exist.`
      });
    }

    const created = await PlaceModel.create(req.body);
    return res.status(201).json({
      success: true,
      message: `Tourist place "${created.place_name}" added successfully.`,
      data: created
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/places/:id - Protected: Update Tourist Place (FR-7.2, FR-7.4)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await PlaceModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Tourist attraction with ID ${id} not found.`
      });
    }

    const validationErrors = validatePlaceInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors: validationErrors
      });
    }

    const categoryId = parseInt(req.body.category_id, 10);
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Selected category ID ${categoryId} does not exist.`
      });
    }

    await PlaceModel.update(id, req.body);
    const updated = await PlaceModel.findById(id);

    return res.json({
      success: true,
      message: `Tourist place "${updated.place_name}" updated successfully.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/places/:id - Protected: Delete Tourist Place (FR-7.3)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await PlaceModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Tourist attraction with ID ${id} not found.`
      });
    }

    await PlaceModel.delete(id);
    return res.json({
      success: true,
      message: `Tourist place "${existing.place_name}" has been deleted.`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
