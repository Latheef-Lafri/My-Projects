/**
 * Local Tourist Day-Visit Planner and Information System
 * Admin Model: src/models/adminModel.js
 * Author: Ahmed ALL (E2410186)
 */

const { query } = require('../../database/db');

class AdminModel {
  static async findByEmail(email) {
    const rows = await query(
      'SELECT admin_id, name, email, password_hash, created_at FROM admins WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async findById(adminId) {
    const rows = await query(
      'SELECT admin_id, name, email, created_at FROM admins WHERE admin_id = ? LIMIT 1',
      [adminId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(name, email, passwordHash) {
    const result = await query(
      'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );
    return {
      admin_id: result.insertId,
      name,
      email: email.toLowerCase().trim()
    };
  }
}

module.exports = AdminModel;
