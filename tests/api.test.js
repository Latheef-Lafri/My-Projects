/**
 * Local Tourist Day-Visit Planner and Information System
 * Automated API & Integration Tests: tests/api.test.js
 * Verifies FR-1.1 through FR-8.3
 * Author: Ahmed ALL (E2410186)
 */

process.env.USE_MOCK_DB = 'true'; // Enable predictable mock data mode for tests
process.env.PORT = '0'; // Ephemeral dynamic port

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server');

let server;
let baseUrl;
let sessionCookie = '';

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
});

test('Public Configuration: GET /api/config returns 25 km radius', async () => {
  const res = await fetch(`${baseUrl}/api/config`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.radius_km, 25.0);
  assert.strictEqual(data.center_coordinates.label, 'Sammanthurai Town Center');
});

test('Categories Listing (FR-2.1): GET /api/categories returns default categories', async () => {
  const res = await fetch(`${baseUrl}/api/categories`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.count >= 7, 'Expected at least 7 tourist categories');
  const catNames = data.data.map(c => c.category_name);
  assert.ok(catNames.includes('Religious'));
  assert.ok(catNames.includes('Nature'));
  assert.ok(catNames.includes('Beach'));
  assert.ok(catNames.includes('Landmark'));
});

test('Attractions Browse (FR-1.1): GET /api/places returns list of places', async () => {
  const res = await fetch(`${baseUrl}/api/places`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.count >= 10, 'Expected at least 10 initial tourist places');
  
  // Verify all places are within 25 km radius of Sammanthurai
  data.data.forEach(place => {
    assert.ok(parseFloat(place.distance_km) <= 25.0, `Place ${place.place_name} exceeds 25km radius`);
  });
});

test('Attraction Search (FR-1.2): GET /api/places?search=Grand Masjid', async () => {
  const res = await fetch(`${baseUrl}/api/places?search=Grand%20Masjid`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.count >= 1);
  assert.ok(data.data[0].place_name.includes('Grand Masjid'));
});

test('Search Empty State Feedback (FR-1.3): GET /api/places?search=nonexistentxyz123', async () => {
  const res = await fetch(`${baseUrl}/api/places?search=nonexistentxyz123`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.count, 0);
  assert.strictEqual(data.data.length, 0);
});

test('Attraction Details (FR-3.1, FR-3.2, FR-3.3): GET /api/places/1', async () => {
  const res = await fetch(`${baseUrl}/api/places/1`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  const p = data.data;
  assert.strictEqual(p.place_id, 1);
  assert.ok(p.place_name);
  assert.ok(p.description);
  assert.ok(p.location);
  assert.ok(p.opening_time);
  assert.ok(p.closing_time);
  assert.ok(p.travel_tips);
  assert.ok(p.visitor_guidelines);
  assert.ok(p.estimated_duration_minutes > 0);
  assert.ok(p.image_url);
});

test('Attraction Details Non-Existent: GET /api/places/99999 returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/places/99999`);
  assert.strictEqual(res.status, 404);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Visit Plan Persistence (FR-5.4): POST /api/plans & GET /api/plans/:id', async () => {
  const planPayload = {
    plan_name: 'Ahmed Family Visit Plan',
    place_ids: [1, 5, 8]
  };

  const postRes = await fetch(`${baseUrl}/api/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planPayload)
  });

  assert.strictEqual(postRes.status, 201);
  const postData = await postRes.json();
  assert.strictEqual(postData.success, true);
  assert.ok(postData.data.plan_id);

  const planId = postData.data.plan_id;
  const getRes = await fetch(`${baseUrl}/api/plans/${planId}`);
  assert.strictEqual(getRes.status, 200);
  const getData = await getRes.json();
  assert.strictEqual(getData.success, true);
  assert.strictEqual(getData.data.plan_id, planId);
});

test('Admin Auth Guard: POST /api/places without session returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ place_name: 'Test Unauthorized' })
  });
  assert.strictEqual(res.status, 401);
});

test('Admin Login Invalid (FR-6.2): POST /api/auth/login returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@touristplanner.local',
      password: 'wrong_password_123'
    })
  });
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Admin Login Valid (FR-6.1): POST /api/auth/login returns session cookie', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@touristplanner.local',
      password: 'admin123'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.admin.email, 'admin@touristplanner.local');

  // Extract session cookie
  const cookieHeader = res.headers.get('set-cookie');
  assert.ok(cookieHeader, 'Expected set-cookie header');
  sessionCookie = cookieHeader.split(';')[0];
});

test('Admin Add Place Validation (FR-7.4): Reject distance > 25km radius', async () => {
  const res = await fetch(`${baseUrl}/api/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      place_name: 'Faraway Site',
      category_id: 1,
      description: 'Beyond 25 km radius',
      location: 'Outside Sammanthurai',
      distance_km: 38.5
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.ok(data.errors.some(e => e.includes('25 km')));
});

test('Admin Add Place Valid (FR-7.1): POST /api/places creates new attraction', async () => {
  const res = await fetch(`${baseUrl}/api/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      place_name: 'Sammanthurai Cultural Library',
      category_id: 5,
      description: 'Historical library archiving Eastern Province literature.',
      location: 'Main Road, Sammanthurai',
      distance_km: 1.5,
      opening_time: '08:00 AM',
      closing_time: '05:00 PM',
      estimated_duration_minutes: 45
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.data.place_id);
});

test('Admin Manage Categories (FR-8.1, FR-8.2): Add & Update Category', async () => {
  const catName = 'Eco-Park-' + Date.now();
  // 1. Add Category (FR-8.1)
  const addRes = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({ category_name: catName })
  });
  assert.strictEqual(addRes.status, 201);
  const addData = await addRes.json();
  const newCatId = addData.data.category_id;

  // 2. Edit Category (FR-8.2)
  const editRes = await fetch(`${baseUrl}/api/categories/${newCatId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({ category_name: catName + ' Updated' })
  });
  assert.strictEqual(editRes.status, 200);

  // 3. Delete unused category (FR-8.3)
  const delRes = await fetch(`${baseUrl}/api/categories/${newCatId}`, {
    method: 'DELETE',
    headers: { 'Cookie': sessionCookie }
  });
  assert.strictEqual(delRes.status, 200);
});

test('Admin Category Protection (FR-8.3): Reject delete category in use', async () => {
  // Category 1 is used by Sammanthurai Grand Masjid
  const delRes = await fetch(`${baseUrl}/api/categories/1`, {
    method: 'DELETE',
    headers: { 'Cookie': sessionCookie }
  });
  assert.strictEqual(delRes.status, 400);
  const data = await delRes.json();
  assert.strictEqual(data.success, false);
  assert.ok(data.message.includes('currently assigned'));
});

test('Admin Logout (FR-6.3): POST /api/auth/logout clears session', async () => {
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Cookie': sessionCookie }
  });
  assert.strictEqual(logoutRes.status, 200);
});
