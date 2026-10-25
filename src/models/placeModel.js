/**
 * Local Tourist Day-Visit Planner and Information System
 * Tourist Place Model: src/models/placeModel.js
 * Author: Ahmed ALL (E2410186)
 */

const { query } = require('../../database/db');

class PlaceModel {
  static async getAll({ search, category_id, sortBy = 'distance_km', sortOrder = 'ASC' } = {}) {
    let sql = `
      SELECT 
        p.place_id,
        p.place_name,
        p.category_id,
        c.category_name,
        p.description,
        p.location,
        p.opening_time,
        p.closing_time,
        p.distance_km,
        p.travel_tips,
        p.visitor_guidelines,
        p.estimated_duration_minutes,
        p.latitude,
        p.longitude,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM tourist_places p
      JOIN categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ` AND p.category_id = ?`;
      params.push(parseInt(category_id, 10));
    }

    if (search && search.trim()) {
      sql += ` AND (p.place_name LIKE ? OR p.description LIKE ? OR p.location LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Sanitize sort column
    const validSortCols = ['distance_km', 'place_name', 'estimated_duration_minutes', 'place_id'];
    const orderCol = validSortCols.includes(sortBy) ? `p.${sortBy}` : 'p.distance_km';
    const orderDir = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${orderCol} ${orderDir}`;

    return await query(sql, params);
  }

  static async findById(placeId) {
    const sql = `
      SELECT 
        p.place_id,
        p.place_name,
        p.category_id,
        c.category_name,
        p.description,
        p.location,
        p.opening_time,
        p.closing_time,
        p.distance_km,
        p.travel_tips,
        p.visitor_guidelines,
        p.estimated_duration_minutes,
        p.latitude,
        p.longitude,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM tourist_places p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.place_id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [placeId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(data) {
    const {
      place_name,
      category_id,
      description,
      location,
      opening_time = '06:00 AM',
      closing_time = '06:00 PM',
      distance_km,
      travel_tips = '',
      visitor_guidelines = '',
      estimated_duration_minutes = 60,
      latitude = null,
      longitude = null,
      image_url = '/uploads/placeholder.svg'
    } = data;

    const sql = `
      INSERT INTO tourist_places (
        place_name,
        category_id,
        description,
        location,
        opening_time,
        closing_time,
        distance_km,
        travel_tips,
        visitor_guidelines,
        estimated_duration_minutes,
        latitude,
        longitude,
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      place_name.trim(),
      parseInt(category_id, 10),
      description.trim(),
      location.trim(),
      opening_time.trim(),
      closing_time.trim(),
      parseFloat(distance_km),
      travel_tips ? travel_tips.trim() : null,
      visitor_guidelines ? visitor_guidelines.trim() : null,
      parseInt(estimated_duration_minutes, 10) || 60,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      image_url ? image_url.trim() : '/uploads/placeholder.svg'
    ];

    const result = await query(sql, params);
    return {
      place_id: result.insertId,
      ...data
    };
  }

  static async update(placeId, data) {
    const {
      place_name,
      category_id,
      description,
      location,
      opening_time,
      closing_time,
      distance_km,
      travel_tips,
      visitor_guidelines,
      estimated_duration_minutes,
      latitude,
      longitude,
      image_url
    } = data;

    const sql = `
      UPDATE tourist_places SET
        place_name = ?,
        category_id = ?,
        description = ?,
        location = ?,
        opening_time = ?,
        closing_time = ?,
        distance_km = ?,
        travel_tips = ?,
        visitor_guidelines = ?,
        estimated_duration_minutes = ?,
        latitude = ?,
        longitude = ?,
        image_url = ?
      WHERE place_id = ?
    `;

    const params = [
      place_name.trim(),
      parseInt(category_id, 10),
      description.trim(),
      location.trim(),
      opening_time.trim(),
      closing_time.trim(),
      parseFloat(distance_km),
      travel_tips ? travel_tips.trim() : null,
      visitor_guidelines ? visitor_guidelines.trim() : null,
      parseInt(estimated_duration_minutes, 10) || 60,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      image_url ? image_url.trim() : null,
      placeId
    ];

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(placeId) {
    const result = await query('DELETE FROM tourist_places WHERE place_id = ?', [placeId]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_places,
        COUNT(DISTINCT category_id) as total_categories_with_places,
        MIN(distance_km) as min_distance,
        MAX(distance_km) as max_distance
      FROM tourist_places
    `;
    const rows = await query(sql);
    return rows[0] || { total_places: 0 };
  }
}

module.exports = PlaceModel;
