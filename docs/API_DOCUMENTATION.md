# REST API Documentation

**Project Title:** Local Tourist Day-Visit Planner and Information System  
**Base URL:** `http://localhost:3000/api`  
**Data Format:** JSON (`Content-Type: application/json`)  
**Authentication:** Cookie-based Session (`connect.sid`)  

---

## 1. System Configuration & Health

### 1.1 GET /api/config
Returns public operational configuration and third-party map availability.
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "app_name": "Local Tourist Day-Visit Planner and Information System",
  "region": "Sammanthurai, Sri Lanka",
  "radius_km": 25.0,
  "center_coordinates": {
    "latitude": 7.3620,
    "longitude": 81.8037,
    "label": "Sammanthurai Town Center"
  },
  "google_maps_configured": false,
  "google_maps_api_key": null,
  "database_status": {
    "connected": true,
    "mode": "mysql"
  }
}
```

### 1.2 GET /api/health
Returns server uptime and database connectivity status.
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-19T15:30:00.000Z",
  "uptime": 124.5,
  "database": { "success": true, "mode": "mysql" }
}
```

---

## 2. Tourist Attractions Endpoints

### 2.1 GET /api/places
Browse, search, and filter tourist attractions within the 25 km radius.
- **Access:** Public
- **Query Parameters:**
  - `search` (optional): Filter places matching name, description, or locality.
  - `category` (optional): Category ID (e.g., `1` for Religious, `4` for Beach).
  - `sortBy` (optional): Field to sort by (`distance_km`, `place_name`, `estimated_duration_minutes`). Default: `distance_km`.
  - `sortOrder` (optional): `ASC` or `DESC`. Default: `ASC`.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "place_id": 1,
      "place_name": "Sammanthurai Grand Masjid",
      "category_id": 1,
      "category_name": "Religious",
      "description": "A historically important mosque...",
      "location": "Hijra Road, Sammanthurai, Eastern Province",
      "opening_time": "04:30 AM",
      "closing_time": "09:30 PM",
      "distance_km": 1.0,
      "travel_tips": "Modest dress is required...",
      "visitor_guidelines": "Maintain silence...",
      "estimated_duration_minutes": 45,
      "latitude": 7.3615,
      "longitude": 81.8025,
      "image_url": "/images/places/sammanthurai-grand-masjid.svg"
    }
  ]
}
```

### 2.2 GET /api/places/:id
Retrieve complete details of a single attraction.
- **Access:** Public
- **Response `200 OK`:** Single place object.
- **Response `404 Not Found`:** If place ID does not exist.

### 2.3 POST /api/places
Create a new tourist place record.
- **Access:** Protected (Administrator session required)
- **Request Body:**
```json
{
  "place_name": "Painthaaru Stream",
  "category_id": 3,
  "description": "Scenic freshwater stream...",
  "location": "Karaitivu-Sammanthurai border",
  "distance_km": 16.0,
  "opening_time": "06:00 AM",
  "closing_time": "06:00 PM",
  "estimated_duration_minutes": 60,
  "latitude": 7.3850,
  "longitude": 81.7820,
  "image_url": "/images/places/painthaaru.svg",
  "travel_tips": "Morning hours provide best light.",
  "visitor_guidelines": "Check water depth before bathing."
}
```
- **Response `201 Created`:** Created attraction object.
- **Response `400 Bad Request`:** Validation failure (e.g. distance > 25.0 km or missing fields).

### 2.4 PUT /api/places/:id
Update an existing tourist place record.
- **Access:** Protected (Administrator session required)
- **Response `200 OK`:** Updated place object.

### 2.5 DELETE /api/places/:id
Delete a tourist place record.
- **Access:** Protected (Administrator session required)
- **Response `200 OK`:** `{ "success": true, "message": "Tourist place has been deleted." }`

---

## 3. Categories Endpoints

### 3.1 GET /api/categories
List all categories with the count of currently assigned attractions.
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 7,
  "data": [
    { "category_id": 1, "category_name": "Religious", "places_count": 2 },
    { "category_id": 4, "category_name": "Beach", "places_count": 2 }
  ]
}
```

### 3.2 POST /api/categories
Create a new category.
- **Access:** Protected (Administrator session required)
- **Request Body:** `{ "category_name": "Eco-Tourism" }`
- **Response `201 Created`**

### 3.3 PUT /api/categories/:id
Rename an existing category.
- **Access:** Protected (Administrator session required)
- **Request Body:** `{ "category_name": "Nature Reserves" }`
- **Response `200 OK`**

### 3.4 DELETE /api/categories/:id
Delete a category.
- **Access:** Protected (Administrator session required)
- **Behavior:** Enforces SRS FR-8.3. If `places_count > 0`, responds with `400 Bad Request` and prevents deletion. If unused, proceeds with deletion and returns `200 OK`.

---

## 4. Authentication Endpoints

### 4.1 POST /api/auth/login
Authenticate administrator credentials and initialize session cookie.
- **Access:** Public (Rate-limited to 15 attempts / 15 minutes)
- **Request Body:**
```json
{
  "email": "admin@touristplanner.local",
  "password": "admin123"
}
```
- **Response `200 OK`:** Sets `connect.sid` HTTP-only cookie and returns administrator object.
- **Response `401 Unauthorized`:** On invalid credentials.

### 4.2 POST /api/auth/logout
Destroy active session and clear cookie.
- **Access:** Public
- **Response `200 OK`:** `{ "success": true, "message": "Administrator logged out successfully." }`

### 4.3 GET /api/auth/me
Check whether current request has an active administrator session.
- **Access:** Public
- **Response `200 OK`:** `{ "authenticated": true, "admin": { ... } }` or `{ "authenticated": false, "admin": null }`

---

## 5. Visit Plans Endpoints

### 5.1 POST /api/plans
Save or share an ordered one-day visit itinerary to the database.
- **Access:** Public
- **Request Body:**
```json
{
  "plan_name": "My Sammanthurai Day Plan",
  "place_ids": [1, 5, 8]
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "plan_id": "plan_9f82d1",
    "plan_name": "My Sammanthurai Day Plan",
    "total_duration_minutes": 165,
    "items": [ ... ]
  }
}
```

### 5.2 GET /api/plans/:id
Retrieve a saved plan by ID.
- **Access:** Public
- **Response `200 OK`:** Plan metadata with ordered stops.
