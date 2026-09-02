/**
 * Local Tourist Day-Visit Planner and Information System
 * Category Routes: src/routes/categoryRoutes.js
 * Implements FR-2.1, FR-8.1, FR-8.2, FR-8.3
 * Author: Ahmed ALL (E2410186)
 */

const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/categoryModel');
const { requireAdmin } = require('../middleware/auth');

// GET /api/categories - Public listing of all categories (FR-2.1)
router.get('/', async (req, res, next) => {
  try {
    const categories = await CategoryModel.getAllWithCount();
    return res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id - Public single category detail
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found.`
      });
    }
    return res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - Protected: Add new category (FR-8.1)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const trimmed = category_name.trim();

    // Check duplicate
    const existing = await CategoryModel.findByName(trimmed);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Category "${trimmed}" already exists.`
      });
    }

    const newCategory = await CategoryModel.create(trimmed);
    return res.status(201).json({
      success: true,
      message: `Category "${trimmed}" created successfully.`,
      data: newCategory
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id - Protected: Edit existing category name (FR-8.2)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const trimmed = category_name.trim();

    const existing = await CategoryModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found.`
      });
    }

    // Check name conflict
    const conflict = await CategoryModel.findByName(trimmed);
    if (conflict && conflict.category_id !== id) {
      return res.status(409).json({
        success: false,
        message: `Another category named "${trimmed}" already exists.`
      });
    }

    await CategoryModel.update(id, trimmed);
    return res.json({
      success: true,
      message: `Category updated successfully to "${trimmed}".`,
      data: { category_id: id, category_name: trimmed }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id - Protected: Delete category if NOT currently assigned to any place (FR-8.3)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found.`
      });
    }

    // Check if category is currently assigned to any tourist place (FR-8.3 requirement)
    const placeCount = await CategoryModel.countPlacesUsingCategory(id);
    if (placeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.category_name}" because it is currently assigned to ${placeCount} tourist attraction(s). Please reassign or delete those attractions first.`
      });
    }

    await CategoryModel.delete(id);
    return res.json({
      success: true,
      message: `Category "${category.category_name}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
