# Requirements Traceability Matrix (RTM)

**Project Title:** Local Tourist Day-Visit Planner and Information System  
**SRS Reference:** Software Requirements Specification Version 1.0 (Ahmed ALL, E2410186)  
**Academic Module:** ITE2953 Programming Group Project 25S2  

---

| Req. ID | Priority | SRS Requirement Description | Implementation Files | Database Entities | Test Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-1.1** | High | The system shall display a list of all available tourist attractions on the main listing page. | `public/places.html`, `public/js/places.js`, `src/routes/placeRoutes.js` | `tourist_places` | `tests/api.test.js`: "Attractions Browse (FR-1.1)" | **VERIFIED PASS** |
| **FR-1.2** | High | The system shall allow the tourist user to search for attractions by entering a keyword matching the attraction name. | `public/places.html`, `public/js/places.js`, `src/models/placeModel.js` | `tourist_places.place_name` | `tests/api.test.js`: "Attraction Search (FR-1.2)" | **VERIFIED PASS** |
| **FR-1.3** | Medium | The system shall display 'no results found' feedback when a search returns no matching attractions. | `public/places.html`, `public/js/places.js` (`empty-state` container) | N/A (UI state) | `tests/api.test.js`: "Search Empty State Feedback (FR-1.3)" | **VERIFIED PASS** |
| **FR-2.1** | High | The system shall allow the tourist user to filter the attraction list by a selected category. | `public/places.html`, `public/js/places.js`, `src/routes/categoryRoutes.js` | `categories`, `tourist_places.category_id` | `tests/api.test.js`: "Categories Listing (FR-2.1)" | **VERIFIED PASS** |
| **FR-2.2** | Medium | The system shall update the displayed list of attractions immediately after a category filter is applied. | `public/places.html`, `public/js/places.js` (DOM event handler) | `tourist_places.category_id` | Tested via filter update handler in browser & automated test | **VERIFIED PASS** |
| **FR-2.3** | Medium | The system shall allow the tourist user to clear an applied filter and return to the full attraction list. | `public/places.html`, `public/js/places.js` (`#btn-clear-filters`) | N/A | Tested via UI reset state and query parameter clearing | **VERIFIED PASS** |
| **FR-3.1** | High | The system shall display the description, category, location, opening time, closing time, distance from Sammanthurai, and travel tips for a selected attraction. | `public/place-details.html`, `public/js/place-details.js`, `src/routes/placeRoutes.js` | `tourist_places` (`description`, `location`, `opening_time`, `closing_time`, `distance_km`, `travel_tips`) | `tests/api.test.js`: "Attraction Details (FR-3.1, FR-3.2, FR-3.3)" | **VERIFIED PASS** |
| **FR-3.2** | Medium | The system shall display at least one image for each tourist attraction, where available. | `public/images/places/*.svg`, `public/place-details.html`, `public/js/place-details.js` | `tourist_places.image_url` | `tests/api.test.js`: Checked `image_url` presence for all 10 records | **VERIFIED PASS** |
| **FR-3.3** | Low | The system shall display estimated visiting time and visitor guidelines for each attraction, where available. | `public/place-details.html`, `public/js/place-details.js` | `tourist_places` (`estimated_duration_minutes`, `visitor_guidelines`) | `tests/api.test.js`: Verified in single place response payload | **VERIFIED PASS** |
| **FR-4.1** | High | The system shall display the location of a selected tourist attraction on an integrated map. | `public/place-details.html`, `public/js/place-details.js` (Leaflet / Google Maps + fallback link) | `tourist_places` (`latitude`, `longitude`) | Manual and automated test verified | **VERIFIED PASS** |
| **FR-4.2** | Medium | The system shall display the locations of all listed attractions on a single overview map. | `public/map.html`, `public/js/map.js` (All markers + 25 km perimeter) | `tourist_places` (`latitude`, `longitude`) | Leaflet & Google Maps integration verified | **VERIFIED PASS** |
| **FR-5.1** | High | The system shall allow the tourist user to add one or more attractions to a one-day visit plan. | `public/js/storage.js`, `public/planner.html`, `public/js/planner.js` | Client `localStorage` + `visit_plans` | `tests/planner.test.js`: "Planner: Adding attractions..." | **VERIFIED PASS** |
| **FR-5.2** | Medium | The system shall allow the tourist user to arrange the order in which selected attractions will be visited. | `public/planner.html`, `public/js/planner.js` (`Move Up` & `Move Down` controls) | `visit_plan_items.visit_order` | `tests/planner.test.js`: "Planner: Reordering stops..." | **VERIFIED PASS** |
| **FR-5.3** | Medium | The system shall allow the tourist user to remove an attraction from the visit plan. | `public/planner.html`, `public/js/planner.js`, `public/js/storage.js` | Client `localStorage` | `tests/planner.test.js`: "Planner: Removing attractions..." | **VERIFIED PASS** |
| **FR-5.4** | High | The system shall display a summary of the created one-day visit plan, including the selected attractions and their order. | `public/planner.html`, `public/css/print.css`, `public/js/planner.js` | `visit_plans`, `visit_plan_items` | `tests/planner.test.js`: "Planner: Calculating duration..." & `tests/api.test.js`: "Visit Plan Persistence" | **VERIFIED PASS** |
| **FR-6.1** | High | The system shall require the administrator to log in with a valid email and password before accessing management functions. | `public/admin/login.html`, `src/routes/authRoutes.js`, `src/middleware/auth.js` | `admins` (`email`, `password_hash`) | `tests/api.test.js`: "Admin Login Valid (FR-6.1)" & "Admin Auth Guard" | **VERIFIED PASS** |
| **FR-6.2** | High | The system shall display an error message when invalid login credentials are entered. | `public/admin/login.html`, `src/routes/authRoutes.js` | `admins` | `tests/api.test.js`: "Admin Login Invalid (FR-6.2)" | **VERIFIED PASS** |
| **FR-6.3** | Medium | The system shall provide a logout function for the administrator. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/authRoutes.js` | `admins` | `tests/api.test.js`: "Admin Logout (FR-6.3)" | **VERIFIED PASS** |
| **FR-7.1** | High | The system shall allow the administrator to add a new tourist place record. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/placeRoutes.js` | `tourist_places` | `tests/api.test.js`: "Admin Add Place Valid (FR-7.1)" | **VERIFIED PASS** |
| **FR-7.2** | High | The system shall allow the administrator to update an existing tourist place record. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/placeRoutes.js` | `tourist_places` | Tested via admin update API and UI | **VERIFIED PASS** |
| **FR-7.3** | High | The system shall allow the administrator to delete a tourist place record. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/placeRoutes.js` | `tourist_places` | Tested via admin delete API and UI confirmation | **VERIFIED PASS** |
| **FR-7.4** | Medium | The system shall validate required fields before saving a new or updated tourist place record. | `src/routes/placeRoutes.js` (`validatePlaceInput`), `public/js/admin.js` | `tourist_places` (`distance_km <= 25.0`) | `tests/api.test.js`: "Admin Add Place Validation (FR-7.4)" | **VERIFIED PASS** |
| **FR-8.1** | Medium | The system shall allow the administrator to add a new attraction category. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/categoryRoutes.js` | `categories` | `tests/api.test.js`: "Admin Manage Categories (FR-8.1, FR-8.2)" | **VERIFIED PASS** |
| **FR-8.2** | Low | The system shall allow the administrator to edit an existing category name. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/categoryRoutes.js` | `categories` | `tests/api.test.js`: "Admin Manage Categories (FR-8.1, FR-8.2)" | **VERIFIED PASS** |
| **FR-8.3** | Low | The system shall allow the administrator to delete a category that is not currently assigned to any tourist place. | `public/admin/index.html`, `public/js/admin.js`, `src/routes/categoryRoutes.js` | `categories`, foreign key constraint `ON DELETE RESTRICT` | `tests/api.test.js`: "Admin Category Protection (FR-8.3)" | **VERIFIED PASS** |

---

## Non-Functional & Security Requirements Verification

1. **Password Security (SRS Section 5.3):**
   - Implemented with salted `bcrypt` hashing (`10` salt rounds).
   - Plain text passwords are never stored in source code or database.
2. **Session Protection (SRS Section 5.3):**
   - Managed with `express-session` using `httpOnly: true`, `sameSite: 'lax'`, and custom random secrets.
3. **SQL Injection Prevention:**
   - 100% of SQL queries executed through parameterized queries (`?` placeholders) with `mysql2`.
4. **Brute Force Rate Limiting:**
   - Implemented via `express-rate-limit` on `/api/auth/login` (max 15 requests / 15 minutes).
5. **Print-Friendly Formatting:**
   - Built via `@media print` in `public/css/print.css`.
6. **Graceful Mapping Fallback:**
   - Automatically supports Google Maps JavaScript API when `GOOGLE_MAPS_API_KEY` is present in `.env`, and seamlessly falls back to Leaflet OpenStreetMap and direct Google Maps external links when key is absent.
