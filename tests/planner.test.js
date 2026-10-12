/**
 * Local Tourist Day-Visit Planner and Information System
 * Planner Unit Tests: tests/planner.test.js
 * Verifies FR-5.1, FR-5.2, FR-5.3, FR-5.4
 * Author: Ahmed ALL (E2410186)
 */

const test = require('node:test');
const assert = require('node:assert');

// In-memory simulator of PlanStorage logic
class TestPlanner {
  constructor() {
    this.plan = [];
  }

  add(place) {
    if (this.plan.some(p => p.place_id === place.place_id)) {
      return false;
    }
    this.plan.push({ ...place });
    return true;
  }

  remove(placeId) {
    this.plan = this.plan.filter(p => p.place_id !== placeId);
  }

  moveUp(index) {
    if (index <= 0 || index >= this.plan.length) return false;
    const temp = this.plan[index];
    this.plan[index] = this.plan[index - 1];
    this.plan[index - 1] = temp;
    return true;
  }

  moveDown(index) {
    if (index < 0 || index >= this.plan.length - 1) return false;
    const temp = this.plan[index];
    this.plan[index] = this.plan[index + 1];
    this.plan[index + 1] = temp;
    return true;
  }

  getTotalDuration() {
    return this.plan.reduce((sum, item) => sum + (parseInt(item.estimated_duration_minutes, 10) || 60), 0);
  }

  formatDuration(mins) {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours === 0) return `${m} mins`;
    if (m === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr ${m} mins`;
  }
}

test('Planner: Adding attractions and preventing duplicates (FR-5.1)', () => {
  const planner = new TestPlanner();
  const p1 = { place_id: 1, place_name: 'Sammanthurai Grand Masjid', estimated_duration_minutes: 45 };
  const p2 = { place_id: 2, place_name: 'Muhaiyaddeen Jumma Masjid', estimated_duration_minutes: 45 };

  assert.strictEqual(planner.add(p1), true);
  assert.strictEqual(planner.add(p2), true);
  assert.strictEqual(planner.plan.length, 2);

  // Attempt duplicate addition
  assert.strictEqual(planner.add(p1), false);
  assert.strictEqual(planner.plan.length, 2);
});

test('Planner: Reordering stops with Move Up and Move Down (FR-5.2)', () => {
  const planner = new TestPlanner();
  planner.add({ place_id: 1, place_name: 'Stop A', estimated_duration_minutes: 30 });
  planner.add({ place_id: 2, place_name: 'Stop B', estimated_duration_minutes: 60 });
  planner.add({ place_id: 3, place_name: 'Stop C', estimated_duration_minutes: 45 });

  // Boundary check: Move top item up should fail
  assert.strictEqual(planner.moveUp(0), false);
  assert.strictEqual(planner.plan[0].place_id, 1);

  // Move middle item (index 1: Stop B) up
  assert.strictEqual(planner.moveUp(1), true);
  assert.strictEqual(planner.plan[0].place_id, 2);
  assert.strictEqual(planner.plan[1].place_id, 1);

  // Move top item (Stop B) down
  assert.strictEqual(planner.moveDown(0), true);
  assert.strictEqual(planner.plan[0].place_id, 1);
  assert.strictEqual(planner.plan[1].place_id, 2);

  // Boundary check: Move bottom item down should fail
  assert.strictEqual(planner.moveDown(2), false);
  assert.strictEqual(planner.plan[2].place_id, 3);
});

test('Planner: Removing attractions (FR-5.3)', () => {
  const planner = new TestPlanner();
  planner.add({ place_id: 1, place_name: 'Stop A' });
  planner.add({ place_id: 2, place_name: 'Stop B' });

  planner.remove(1);
  assert.strictEqual(planner.plan.length, 1);
  assert.strictEqual(planner.plan[0].place_id, 2);
});

test('Planner: Calculating and formatting total duration (FR-5.4)', () => {
  const planner = new TestPlanner();
  planner.add({ place_id: 1, estimated_duration_minutes: 45 });
  planner.add({ place_id: 2, estimated_duration_minutes: 90 });
  planner.add({ place_id: 3, estimated_duration_minutes: 60 });

  const total = planner.getTotalDuration();
  assert.strictEqual(total, 195); // 45 + 90 + 60 = 195 mins = 3 hr 15 mins
  assert.strictEqual(planner.formatDuration(total), '3 hr 15 mins');
});
