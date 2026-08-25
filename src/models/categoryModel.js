/**
 * Local Tourist Day-Visit Planner and Information System
 * Category Model: src/models/categoryModel.js
 * Author: Ahmed ALL (E2410186)
 */

const { query } = require('../../database/db');

class CategoryModel {
  static async getAllWithCount() {
    const sql = `
      SELECT 
        c.category_id, 
        c.category_name, 
        c.created_at,
        COUNT(p.place_id) AS places_count
      FROM categories c
      LEFT JOIN tourist_places p ON c.category_id = p.category_id
      GROUP BY c.category_id, c.category_name, c.created_at
      ORDER BY c.category_name ASC
    `;
    return await query(sql);
  }

  static async findById(categoryId) {
    const rows = await query(
      'SELECT category_id, category_name FROM categories WHERE category_id = ? LIMIT 1',
      [categoryId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByName(name) {
    const rows = await query(
      'SELECT category_id, category_name FROM categories WHERE LOWER(category_name) = LOWER(?) LIMIT 1',
      [name.trim()]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async countPlacesUsingCategory(categoryId) {
    const rows = await query(
      'SELECT COUNT(*) as count FROM tourist_places WHERE category_id = ?',
      [categoryId]
    );
    return rows[0] ? rows[0].count : 0;
  }

  static async create(name) {
    const result = await query(
      'INSERT INTO categories (category_name) VALUES (?)',
      [name.trim()]
    );
    return {
      category_id: result.insertId,
      category_name: name.trim()
    };
  }

  static async update(categoryId, name) {
    const result = await query(
      'UPDATE categories SET category_name = ? WHERE category_id = ?',
      [name.trim(), categoryId]
    );
    return result.affectedRows > 0;
  }

  static async delete(categoryId) {
    const result = await query(
      'DELETE FROM categories WHERE category_id = ?',
      [categoryId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;
