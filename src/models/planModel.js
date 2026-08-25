/**
 * Local Tourist Day-Visit Planner and Information System
 * Visit Plan Model: src/models/planModel.js
 * Author: Ahmed ALL (E2410186)
 */

const { query } = require('../../database/db');

class PlanModel {
  static async savePlan(planId, planName, placeIds) {
    // 1. Create or replace plan record
    await query(
      'INSERT INTO visit_plans (plan_id, plan_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name)',
      [planId, planName || 'My One-Day Plan']
    );

    // 2. Clear old items for this plan
    await query('DELETE FROM visit_plan_items WHERE plan_id = ?', [planId]);

    // 3. Insert items in designated visit order
    for (let index = 0; index < placeIds.length; index++) {
      const placeId = parseInt(placeIds[index], 10);
      const visitOrder = index + 1;
      await query(
        'INSERT INTO visit_plan_items (plan_id, place_id, visit_order) VALUES (?, ?, ?)',
        [planId, placeId, visitOrder]
      );
    }

    return await this.getPlanById(planId);
  }

  static async getPlanById(planId) {
    const plans = await query(
      'SELECT plan_id, plan_name, created_at, updated_at FROM visit_plans WHERE plan_id = ? LIMIT 1',
      [planId]
    );

    if (plans.length === 0) return null;
    const plan = plans[0];

    const items = await query(
      `
      SELECT 
        vpi.visit_order,
        p.place_id,
        p.place_name,
        c.category_name,
        p.description,
        p.location,
        p.opening_time,
        p.closing_time,
        p.distance_km,
        p.estimated_duration_minutes,
        p.travel_tips,
        p.visitor_guidelines,
        p.latitude,
        p.longitude,
        p.image_url
      FROM visit_plan_items vpi
      JOIN tourist_places p ON vpi.place_id = p.place_id
      JOIN categories c ON p.category_id = c.category_id
      WHERE vpi.plan_id = ?
      ORDER BY vpi.visit_order ASC
      `,
      [planId]
    );

    plan.items = items;
    plan.total_duration_minutes = items.reduce((acc, item) => acc + (item.estimated_duration_minutes || 60), 0);
    return plan;
  }
}

module.exports = PlanModel;
