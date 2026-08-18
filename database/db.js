/**
 * Local Tourist Day-Visit Planner and Information System
 * Database Connection Module (mysql2/promise)
 * Author: Ahmed ALL (E2410186)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tourist_planner_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let isConnected = false;

// Mock database store for testing or offline demonstrations when MySQL server is not active
let mockStore = null;

function initializeMockStore() {
  if (mockStore) return mockStore;

  const defaultCategories = [
    { category_id: 1, category_name: 'Religious' },
    { category_id: 2, category_name: 'Heritage' },
    { category_id: 3, category_name: 'Nature' },
    { category_id: 4, category_name: 'Beach' },
    { category_id: 5, category_name: 'Educational' },
    { category_id: 6, category_name: 'Landmark' },
    { category_id: 7, category_name: 'Recreation' }
  ];

  const defaultPlaces = [
    {
      place_id: 1,
      place_name: 'Sammanthurai Grand Masjid',
      category_id: 1,
      category_name: 'Religious',
      description: 'A historically important mosque in Sammanthurai renowned for its distinctive Islamic architectural elements and deep cultural importance.',
      location: 'Hijra Road, Sammanthurai, Eastern Province',
      opening_time: '04:30 AM',
      closing_time: '09:30 PM',
      distance_km: 1.0,
      travel_tips: 'Modest dress is required for all visitors. Please remove footwear prior to entering prayer halls.',
      visitor_guidelines: 'Maintain silence in and around prayer areas. Photography should be conducted politely with permission.',
      estimated_duration_minutes: 45,
      latitude: 7.3615,
      longitude: 81.8025,
      image_url: '/images/places/sammanthurai-grand-masjid.svg'
    },
    {
      place_id: 2,
      place_name: 'Muhaiyaddeen Jumma Masjid, Kalmunai',
      category_id: 1,
      category_name: 'Religious',
      description: 'A celebrated historic mosque located in the coastal city of Kalmunai. Famous for its classic coastal Islamic architecture and ornate minarets.',
      location: 'Main Street, Kalmunai, Eastern Province',
      opening_time: '04:30 AM',
      closing_time: '09:00 PM',
      distance_km: 14.0,
      travel_tips: 'Best visited outside peak Friday congregational prayers (Jummah 12:00 - 13:30) for quiet sightseeing.',
      visitor_guidelines: 'Remove footwear at entrance. Keep devices on silent. Ask local guides for permission before recording.',
      estimated_duration_minutes: 45,
      latitude: 7.4168,
      longitude: 81.8294,
      image_url: '/images/places/muhaiyaddeen-masjid.svg'
    },
    {
      place_id: 3,
      place_name: 'Chadayanthalava',
      category_id: 3,
      category_name: 'Nature',
      description: 'A peaceful natural reservoir and rock formation retreat ideal for family picnics, bird watching, and unwinding amidst serene rural greenery.',
      location: 'Chadayanthalava Tank, Ampara District',
      opening_time: '06:00 AM',
      closing_time: '06:00 PM',
      distance_km: 18.0,
      travel_tips: 'Carry drinking water and packed refreshments. Comfortable walking shoes recommended.',
      visitor_guidelines: 'Do not litter or dispose of plastics into the tank or scrublands.',
      estimated_duration_minutes: 90,
      latitude: 7.3480,
      longitude: 81.6750,
      image_url: '/images/places/chadayanthalava.svg'
    },
    {
      place_id: 4,
      place_name: 'Painthaaru',
      category_id: 3,
      category_name: 'Nature',
      description: 'A scenic freshwater stream and bathing spot surrounded by lush paddy and canal waterways, known for cool running waters.',
      location: 'Painthaaru Stream, Karaitivu-Sammanthurai border',
      opening_time: '06:00 AM',
      closing_time: '06:00 PM',
      distance_km: 16.0,
      travel_tips: 'Morning hours or mid-afternoon provide best light and gentle temperature. Bring a change of dry clothes.',
      visitor_guidelines: 'Check water depth before bathing, especially after monsoon rainfall.',
      estimated_duration_minutes: 60,
      latitude: 7.3850,
      longitude: 81.7820,
      image_url: '/images/places/painthaaru.svg'
    },
    {
      place_id: 5,
      place_name: 'Kalmunai Beach',
      category_id: 4,
      category_name: 'Beach',
      description: 'A sweeping stretch of golden sand along the Indian Ocean in Kalmunai. A prime destination for sunrise gazing and gentle ocean strolls.',
      location: 'Coastal Road, Kalmunai',
      opening_time: '05:30 AM',
      closing_time: '07:00 PM',
      distance_km: 14.0,
      travel_tips: 'Arrive early between 05:45 and 06:30 AM to witness magnificent sunrise colors over the Bay of Bengal.',
      visitor_guidelines: 'Open sea currents can be unpredictable; swim only in designated tranquil shore sections.',
      estimated_duration_minutes: 75,
      latitude: 7.4150,
      longitude: 81.8385,
      image_url: '/images/places/kalmunai-beach.svg'
    },
    {
      place_id: 6,
      place_name: 'South Eastern University of Sri Lanka',
      category_id: 5,
      category_name: 'Educational',
      description: 'A distinguished national university located in Oluvil with modern academic architecture and spacious palm-lined avenues.',
      location: 'University Park, Oluvil',
      opening_time: '08:30 AM',
      closing_time: '05:00 PM',
      distance_km: 8.0,
      travel_tips: 'Visitors must present national ID at security. Weekdays offer the best experience of university atmosphere.',
      visitor_guidelines: 'Maintain decorum on campus grounds; refrain from loud noises near lecture halls.',
      estimated_duration_minutes: 60,
      latitude: 7.2965,
      longitude: 81.8505,
      image_url: '/images/places/seusl.svg'
    },
    {
      place_id: 7,
      place_name: 'Oluvil Harbour',
      category_id: 6,
      category_name: 'Landmark',
      description: 'An impressive maritime and fishery harbor built along the Oluvil coastline offering panoramic views of breakwaters and sea vessels.',
      location: 'Oluvil Coast, Eastern Province',
      opening_time: '06:00 AM',
      closing_time: '06:00 PM',
      distance_km: 10.0,
      travel_tips: 'Bring sunglasses and sun protection. Check with gate marshals regarding authorized scenic walkways.',
      visitor_guidelines: 'Adhere strictly to harbor security directives; never climb wet submerged breakwaters.',
      estimated_duration_minutes: 45,
      latitude: 7.2885,
      longitude: 81.8670,
      image_url: '/images/places/oluvil-harbour.svg'
    },
    {
      place_id: 8,
      place_name: 'Oluvil Lighthouse',
      category_id: 6,
      category_name: 'Landmark',
      description: 'A picturesque 24-meter coastal lighthouse built in 1999 on the Oluvil shoreline providing scenic ocean vistas and top-tier photography.',
      location: 'Oluvil Beachfront, Oluvil',
      opening_time: '06:00 AM',
      closing_time: '06:30 PM',
      distance_km: 10.0,
      travel_tips: 'Golden hour before dusk (17:00 - 18:15) offers phenomenal lighting for photography against the white lighthouse.',
      visitor_guidelines: 'Watch footing on loose sandy ridges. Respect fenced areas.',
      estimated_duration_minutes: 45,
      latitude: 7.2892,
      longitude: 81.8680,
      image_url: '/images/places/oluvil-lighthouse.svg'
    },
    {
      place_id: 9,
      place_name: 'Oluvil Beach',
      category_id: 4,
      category_name: 'Beach',
      description: 'A tranquil and unspoiled coastal beach fringed with coastal casuarina trees and sand dunes, ideal for peace-seekers and soundscapes.',
      location: 'Oluvil Coast Road, Oluvil',
      opening_time: '05:30 AM',
      closing_time: '06:30 PM',
      distance_km: 10.0,
      travel_tips: 'A quieter alternative to urban beaches. Great for peaceful reading or contemplative morning walks.',
      visitor_guidelines: 'Take all disposable items back with you. Avoid deep water during strong surf.',
      estimated_duration_minutes: 60,
      latitude: 7.2930,
      longitude: 81.8640,
      image_url: '/images/places/oluvil-beach.svg'
    },
    {
      place_id: 10,
      place_name: 'Green Park, Ampara',
      category_id: 7,
      category_name: 'Recreation',
      description: 'A beautifully landscaped public recreational park near Ampara Tank featuring paved walking loops, shady canopy trees, and playgrounds.',
      location: 'Inginiyagala Road, Near Ampara Tank, Ampara',
      opening_time: '06:00 AM',
      closing_time: '07:30 PM',
      distance_km: 22.0,
      travel_tips: 'Great place for family outings and relaxation at the end of a touring day. Late afternoons provide a pleasant breeze.',
      visitor_guidelines: 'A nominal municipal entry fee may apply. Keep gardens clean.',
      estimated_duration_minutes: 90,
      latitude: 7.2890,
      longitude: 81.6720,
      image_url: '/images/places/green-park-ampara.svg'
    }
  ];

  const defaultAdmins = [
    {
      admin_id: 1,
      name: 'System Administrator',
      email: 'admin@touristplanner.local',
      // bcrypt hash for 'admin123'
      password_hash: '$2a$10$OUYY6ryM0wPwMDoxzpjJSuqZ4kBbGU7Z.97PoQzwKqSfbenEmND/i'
    }
  ];

  const defaultPlans = {};

  mockStore = {
    categories: defaultCategories,
    places: defaultPlaces,
    admins: defaultAdmins,
    plans: defaultPlans
  };

  return mockStore;
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Test connectivity to MySQL database
 */
async function testConnection() {
  if (process.env.USE_MOCK_DB === 'true') {
    initializeMockStore();
    isConnected = true;
    return { success: true, mode: 'mock', message: 'Running with internal mock store (USE_MOCK_DB=true)' };
  }

  try {
    const p = getPool();
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    return { success: true, mode: 'mysql', message: 'Successfully connected to MySQL database: ' + dbConfig.database };
  } catch (err) {
    isConnected = false;
    // If MySQL connection fails, and we are in development or testing, fall back safely
    if (process.env.NODE_ENV !== 'production') {
      initializeMockStore();
      return {
        success: false,
        fallbackActive: true,
        mode: 'fallback',
        error: err.message,
        message: `MySQL unreachable (${err.code || err.message}). Fallback store active for preview and testing.`
      };
    }
    return { success: false, mode: 'mysql', error: err.message };
  }
}

/**
 * Execute parameterized query using MySQL or fallback store
 */
async function query(sql, params = []) {
  if (process.env.USE_MOCK_DB === 'true' || (!isConnected && mockStore)) {
    return executeMockQuery(sql, params);
  }

  try {
    const p = getPool();
    const [rows, fields] = await p.execute(sql, params);
    return rows;
  } catch (err) {
    // If MySQL disconnected or database not initialized, fallback if mock store exists
    if (mockStore && (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR' || err.code === 'PROTOCOL_CONNECTION_LOST')) {
      console.warn(`[DB WARNING] MySQL error (${err.code}). Using local fallback dataset.`);
      return executeMockQuery(sql, params);
    }
    throw err;
  }
}

/**
 * Lightweight mock SQL executor for testing and standalone demonstration
 */
function executeMockQuery(sql, params = []) {
  const store = initializeMockStore();
  const trimmed = sql.trim();

  // Tourist Places queries (check first because place queries JOIN categories)
  if (/FROM[\s\S]+tourist_places/is.test(trimmed)) {
    // Count places using category (for FK protection FR-8.3)
    if (/COUNT\(.*\) as count[\s\S]*WHERE[\s\S]*category_id/is.test(trimmed)) {
      const catId = parseInt(params[0], 10);
      const count = store.places.filter(p => p.category_id === catId).length;
      return [{ count }];
    }

    // Single Place by ID
    if (/WHERE[\s\S]*(p\.)?place_id\s*=\s*\?/is.test(trimmed)) {
      const id = parseInt(params[0], 10);
      const place = store.places.find(p => p.place_id === id);
      if (!place) return [];
      const cat = store.categories.find(c => c.category_id === place.category_id);
      return [{ ...place, category_name: cat ? cat.category_name : 'General' }];
    }

    // List with search / category filters
    let list = store.places.map(p => {
      const cat = store.categories.find(c => c.category_id === p.category_id);
      return { ...p, category_name: cat ? cat.category_name : 'General' };
    });

    if (params.length > 0) {
      if (/category_id\s*=\s*\?/is.test(trimmed) && /place_name[\s\S]*LIKE/is.test(trimmed)) {
        const catId = parseInt(params[0], 10);
        const search = String(params[1]).replace(/%/g, '').toLowerCase();
        list = list.filter(p => p.category_id === catId && (p.place_name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)));
      } else if (/category_id\s*=\s*\?/is.test(trimmed)) {
        const catId = parseInt(params[0], 10);
        list = list.filter(p => p.category_id === catId);
      } else if (/place_name[\s\S]*LIKE/is.test(trimmed)) {
        const search = String(params[0]).replace(/%/g, '').toLowerCase();
        list = list.filter(p => p.place_name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search) || p.location.toLowerCase().includes(search));
      }
    }

    return list;
  }

  // Categories queries (FROM categories)
  if (/FROM[\s\S]+categories/is.test(trimmed)) {
    if (/WHERE[\s\S]*category_id\s*=\s*\?/is.test(trimmed)) {
      const id = parseInt(params[0], 10);
      const cat = store.categories.find(c => c.category_id === id);
      return cat ? [cat] : [];
    }
    if (/WHERE[\s\S]*category_name[\s\S]*\?/is.test(trimmed)) {
      const name = String(params[0]).toLowerCase();
      const cat = store.categories.find(c => c.category_name.toLowerCase() === name);
      return cat ? [cat] : [];
    }
    // Return all categories with places count
    return store.categories.map(c => {
      const count = store.places.filter(p => p.category_id === c.category_id).length;
      return { ...c, places_count: count };
    });
  }

  // Insert Place
  if (/INSERT INTO[\s\S]*tourist_places/is.test(trimmed)) {
    const [name, catId, desc, loc, opTime, clTime, dist, tips, guide, dur, lat, lng, img] = params;
    const newId = store.places.length > 0 ? Math.max(...store.places.map(p => p.place_id)) + 1 : 1;
    const newPlace = {
      place_id: newId,
      place_name: name,
      category_id: parseInt(catId, 10),
      description: desc,
      location: loc,
      opening_time: opTime,
      closing_time: clTime,
      distance_km: parseFloat(dist),
      travel_tips: tips,
      visitor_guidelines: guide,
      estimated_duration_minutes: parseInt(dur, 10) || 60,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      image_url: img || '/images/places/placeholder.svg'
    };
    store.places.push(newPlace);
    return { insertId: newId, affectedRows: 1 };
  }

  // Update Place
  if (/UPDATE[\s\S]*tourist_places[\s\S]*SET/is.test(trimmed)) {
    const [name, catId, desc, loc, opTime, clTime, dist, tips, guide, dur, lat, lng, img, placeId] = params;
    const id = parseInt(placeId, 10);
    const place = store.places.find(p => p.place_id === id);
    if (place) {
      place.place_name = name;
      place.category_id = parseInt(catId, 10);
      place.description = desc;
      place.location = loc;
      place.opening_time = opTime;
      place.closing_time = clTime;
      place.distance_km = parseFloat(dist);
      place.travel_tips = tips;
      place.visitor_guidelines = guide;
      place.estimated_duration_minutes = parseInt(dur, 10) || 60;
      place.latitude = lat ? parseFloat(lat) : null;
      place.longitude = lng ? parseFloat(lng) : null;
      place.image_url = img || place.image_url;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // Insert Category
  if (/INSERT INTO[\s\S]*categories/is.test(trimmed)) {
    const name = params[0];
    const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.category_id)) + 1 : 1;
    const newCat = { category_id: newId, category_name: name };
    store.categories.push(newCat);
    return { insertId: newId, affectedRows: 1 };
  }

  // Update Category
  if (/UPDATE[\s\S]*categories[\s\S]*SET[\s\S]*category_name/is.test(trimmed)) {
    const name = params[0];
    const id = parseInt(params[1], 10);
    const cat = store.categories.find(c => c.category_id === id);
    if (cat) {
      cat.category_name = name;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // Delete Category
  if (/DELETE FROM[\s\S]*categories[\s\S]*WHERE[\s\S]*category_id/is.test(trimmed)) {
    const id = parseInt(params[0], 10);
    const before = store.categories.length;
    store.categories = store.categories.filter(c => c.category_id !== id);
    return { affectedRows: before - store.categories.length };
  }

  // Delete Place
  if (/DELETE FROM[\s\S]*tourist_places[\s\S]*WHERE[\s\S]*place_id/is.test(trimmed)) {
    const id = parseInt(params[0], 10);
    const before = store.places.length;
    store.places = store.places.filter(p => p.place_id !== id);
    return { affectedRows: before - store.places.length };
  }

  // Admins queries
  if (/SELECT[\s\S]*FROM[\s\S]*admins[\s\S]*WHERE[\s\S]*email/is.test(trimmed)) {
    const email = String(params[0]).toLowerCase();
    const admin = store.admins.find(a => a.email.toLowerCase() === email);
    return admin ? [admin] : [];
  }
  if (/SELECT[\s\S]*FROM[\s\S]*admins[\s\S]*WHERE[\s\S]*admin_id/is.test(trimmed)) {
    const id = parseInt(params[0], 10);
    const admin = store.admins.find(a => a.admin_id === id);
    return admin ? [admin] : [];
  }
  if (/INSERT INTO[\s\S]*admins/is.test(trimmed)) {
    const [name, email, passwordHash] = params;
    const newId = store.admins.length > 0 ? Math.max(...store.admins.map(a => a.admin_id)) + 1 : 1;
    store.admins.push({
      admin_id: newId,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash
    });
    return { insertId: newId, affectedRows: 1 };
  }

  // Counts / Stats query
  if (/SELECT[\s\S]*COUNT\(.*\) as total_places/is.test(trimmed)) {
    return [{
      total_places: store.places.length,
      total_categories: store.categories.length
    }];
  }

  // Visit plans
  if (/INSERT INTO[\s\S]*visit_plans/is.test(trimmed)) {
    const [planId, planName] = params;
    store.plans[planId] = { plan_id: planId, plan_name: planName, items: [] };
    return { affectedRows: 1 };
  }
  if (/INSERT INTO[\s\S]*visit_plan_items/is.test(trimmed)) {
    const [planId, placeId, visitOrder] = params;
    if (store.plans[planId]) {
      const place = store.places.find(p => p.place_id === parseInt(placeId, 10));
      store.plans[planId].items.push({
        place_id: parseInt(placeId, 10),
        place_name: place ? place.place_name : 'Attraction',
        visit_order: parseInt(visitOrder, 10),
        estimated_duration_minutes: place ? place.estimated_duration_minutes : 60
      });
    }
    return { affectedRows: 1 };
  }
  if (/SELECT[\s\S]*FROM[\s\S]*visit_plans[\s\S]*WHERE[\s\S]*plan_id/is.test(trimmed)) {
    const planId = params[0];
    const plan = store.plans[planId];
    if (!plan) return [];
    return [plan];
  }
  if (/SELECT[\s\S]*FROM[\s\S]*visit_plan_items/is.test(trimmed)) {
    const planId = params[0];
    const plan = store.plans[planId];
    if (!plan || !plan.items) return [];
    return plan.items;
  }
  if (/DELETE FROM[\s\S]*visit_plan_items[\s\S]*WHERE[\s\S]*plan_id/is.test(trimmed)) {
    const planId = params[0];
    if (store.plans[planId]) {
      store.plans[planId].items = [];
    }
    return { affectedRows: 1 };
  }

  // Fallback for general unhandled queries
  return [];
}


module.exports = {
  dbConfig,
  getPool,
  testConnection,
  query,
  initializeMockStore
};
