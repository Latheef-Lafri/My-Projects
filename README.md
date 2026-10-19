# Local Tourist Day-Visit Planner and Information System

**Target Geographic Scope:** Sammanthurai and Surrounding Areas (Within 25 km Radius), Eastern Province, Sri Lanka  
**Academic Module:** ITE2953 – Programming Group Project 25S2  
**Author:** Ahmed ALL (Registration Number: E2410186)  
**SRS Version:** 1.0 (21 August 2026)  

---

## 1. Project Overview

The **Local Tourist Day-Visit Planner and Information System** is a full-stack web application designed to centralize scattered tourist attraction details and empower visitors to plan seamless one-day visits around Sammanthurai. 

Tourists can explore verified attractions, filter by category, view location maps with visit duration estimates, and construct a custom one-day itinerary with reordering controls (`Move Up` / `Move Down`), print-friendly outputs, and browser local storage persistence.

---

## 2. Technology Stack

- **Frontend Presentation Layer:** Semantic HTML5, Vanilla CSS3 (custom glassmorphism design system, responsive grid), Vanilla JavaScript (ES6+ async/await).
- **Backend Application Layer:** Node.js runtime with Express.js framework.
- **Relational Data Layer:** MySQL database accessed via parameterized `mysql2/promise` connection pooling.
- **Admin Authentication & Security:** `express-session` with secure HTTP-only cookies, salted `bcryptjs` password hashing, and brute-force rate limiting (`express-rate-limit`).
- **Mapping Services:** Dynamic Google Maps Platform integration when an API key is configured, with an interactive Leaflet / OpenStreetMap fallback and external navigation links.

---

## 3. Project Directory Structure

```
My-Projects/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file for secrets & node_modules
├── package.json                  # Scripts & dependencies
├── server.js                     # Express application entry point
├── database/
│   ├── schema.sql                # Complete MySQL DDL schema
│   ├── seed.sql                  # Seed data: 7 categories, 10 proposed places, default admin
│   └── db.js                     # MySQL2 connection pool with diagnostics & mock fallback
├── scripts/
│   ├── init-db.js                # Database initialization script (npm run db:init)
│   └── create-admin.js           # Secure CLI script to create new administrator (npm run admin:create)
├── src/
│   ├── middleware/
│   │   ├── auth.js               # Admin session verification middleware
│   │   ├── rateLimiter.js        # Login rate limiter (brute-force defense)
│   │   └── errorHandler.js       # Centralized JSON error handling
│   ├── models/
│   │   ├── adminModel.js         # Admin authentication queries
│   │   ├── categoryModel.js      # Category queries with referential integrity checks
│   │   ├── placeModel.js         # Place browsing, search, and CRUD queries
│   │   └── planModel.js          # Visit plan persistence queries
│   └── routes/
│       ├── authRoutes.js         # Login, logout, session verification
│       ├── categoryRoutes.js     # Public category list & protected CRUD
│       ├── placeRoutes.js        # Public search/filter & protected place CRUD
│       ├── planRoutes.js         # Save and retrieve visit plans
│       └── configRoutes.js       # Public frontend configuration & maps status
├── public/                       # Frontend Presentation Layer
│   ├── index.html                # Home page with hero, search, categories, featured cards
│   ├── places.html               # Dedicated catalog with keyword search & category filters
│   ├── place-details.html        # Attraction details page with map and guidelines
│   ├── planner.html              # One-Day Visit Planner (Move Up/Down, duration, print)
│   ├── map.html                  # Overview interactive map of all attractions (25 km radius)
│   ├── 404.html                  # Custom 404 error page
│   ├── admin/
│   │   ├── login.html            # Administrator login page
│   │   ├── index.html            # Administrator control panel
│   │   └── admin.css             # Admin styling
│   ├── css/
│   │   ├── styles.css            # Master design system & glassmorphism theme
│   │   └── print.css             # Print-friendly stylesheet for itinerary
│   ├── js/
│   │   ├── api.js                # Centralized API fetch client
│   │   ├── storage.js            # Client-side localStorage itinerary manager
│   │   ├── main.js               # Common UI helpers and toast notifications
│   │   ├── home.js               # Home page logic
│   │   ├── places.js             # Places catalog search and filtering
│   │   ├── place-details.js      # Place details controller and single map
│   │   ├── planner.js            # Planner reordering, duration calculation, and print
│   │   ├── map.js                # Overview map controller (all markers)
│   │   └── admin.js              # Admin dashboard CRUD handlers and modals
│   └── images/
│       └── places/               # SVG visual assets for all 10 attractions
├── tests/
│   ├── api.test.js               # Automated integration tests for all API routes & requirements
│   └── planner.test.js           # Unit tests for planner duration and reordering logic
└── docs/
    ├── USER_GUIDE.md             # Comprehensive user guide for tourists
    ├── ADMIN_GUIDE.md            # Administrator portal operating guide
    ├── API_DOCUMENTATION.md      # Detailed REST API specification
    └── REQUIREMENTS_TRACEABILITY.md # Traceability table mapping SRS FR-1.1 - FR-8.3
```

---

## 4. Initial Proposed Tourist Attractions (≤ 25 km Radius)

All 10 attractions from the Project Proposal have been verified within the designated 25 km radius of Sammanthurai:

| # | Attraction Name | Category | Approx. Distance | Location | Estimated Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Sammanthurai Grand Masjid** | Religious | ~1.0 km | Hijra Road, Sammanthurai | 45 mins |
| 2 | **Muhaiyaddeen Jumma Masjid** | Religious | ~14.0 km | Main Street, Kalmunai | 45 mins |
| 3 | **Chadayanthalava** | Nature | ~18.0 km | Chadayanthalava Tank | 90 mins |
| 4 | **Painthaaru** | Nature | ~16.0 km | Karaitivu-Sammanthurai border | 60 mins |
| 5 | **Kalmunai Beach** | Beach | ~14.0 km | Coastal Road, Kalmunai | 75 mins |
| 6 | **South Eastern University (SEUSL)** | Educational | ~8.0 km | University Park, Oluvil | 60 mins |
| 7 | **Oluvil Harbour** | Landmark | ~10.0 km | Oluvil Coast | 45 mins |
| 8 | **Oluvil Lighthouse** | Landmark | ~10.0 km | Oluvil Beachfront | 45 mins |
| 9 | **Oluvil Beach** | Beach | ~10.0 km | Oluvil Coast Road | 60 mins |
| 10 | **Green Park, Ampara** | Recreation | ~22.0 km | Near Ampara Tank, Ampara | 90 mins |

---

## 5. Installation & Startup Guide (Windows & VS Code)

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Go to **File → Open Folder...** and select:
   ```
   g:\GitHub\BIT\My-Projects
   ```

### Step 2: Install Node.js Dependencies
Open the integrated terminal in VS Code (<kbd>Ctrl</kbd> + <kbd>`</kbd>) and run:
```powershell
npm install
```
*(On Windows PowerShell with strict execution policies, run `cmd.exe /c "npm install"`)*

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env` configuration file:
```powershell
Copy-Item .env.example .env
```
Ensure your database settings match your local MySQL configuration:
```env
PORT=3000
NODE_ENV=development

# MySQL Settings (Default XAMPP Configuration)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tourist_planner_db

SESSION_SECRET=dev_local_tourist_secret_key_892374892374

# Optional: Set Google Maps API Key or leave blank for interactive Leaflet fallback
GOOGLE_MAPS_API_KEY=
```

### Step 4: Configure and Start MySQL Server
1. **Using XAMPP (Recommended):**
   - Open **XAMPP Control Panel**.
   - Click the **Start** button next to **MySQL**.
   - Verify port `3306` shows as active.
2. **Using Standard MySQL Windows Service:**
   - Ensure the `MySQL` or `MySQL80` service is running in Windows Services (`services.msc`).

### Step 5: Initialize the Database & Seed Data
Execute the automated initialization script:
```powershell
npm run db:init
```
This script performs the following tasks:
- Creates the `tourist_planner_db` database if it does not exist.
- Creates all 4 normalized tables (`admins`, `categories`, `tourist_places`, `visit_plans`, `visit_plan_items`).
- Seeds the 7 official tourist categories.
- Seeds the 10 initial attractions within the 25 km radius.
- Seeds the default administrator (`admin@touristplanner.local` / `admin123`).

### Step 6: (Optional) Create a Custom Administrator
Run the interactive administrator creation script:
```powershell
npm run admin:create
```

### Step 7: Start the Application Server
Run the startup command:
```powershell
npm start
```
Or run with auto-reload in development mode:
```powershell
npm run dev
```

### Step 8: Open the Web Application
Open your browser (Google Chrome or Microsoft Edge) and navigate to:
- **Public Tourism Portal:** [http://localhost:3000](http://localhost:3000)
- **Attractions Catalog:** [http://localhost:3000/places.html](http://localhost:3000/places.html)
- **One-Day Visit Planner:** [http://localhost:3000/planner.html](http://localhost:3000/planner.html)
- **Overview Map:** [http://localhost:3000/map.html](http://localhost:3000/map.html)
- **Administrator Login:** [http://localhost:3000/admin/login.html](http://localhost:3000/admin/login.html)
  *(Default credentials: `admin@touristplanner.local` / `admin123`)*

---

## 6. Running Automated Tests

The application includes an automated test suite verifying all 20 requirements (FR-1.1 through FR-8.3):
```powershell
npm test
```
**Test Results:**
- 20 of 20 test cases pass with 0 failures.
- Tests verify public browsing, search keywords, category filtering, 'no results found' feedback, details view, plan storage, duration math, authentication, rate limiting, and administrative CRUD operations.

---

## 7. Requirements Traceability

A full mapping between SRS functional requirements FR-1.1 through FR-8.3 and implementation components is available in:  
📄 [docs/REQUIREMENTS_TRACEABILITY.md](file:///g:/GitHub/BIT/My-Projects/docs/REQUIREMENTS_TRACEABILITY.md)

---

## 8. Documentation Links

- 📖 [User Guide](file:///g:/GitHub/BIT/My-Projects/docs/USER_GUIDE.md)
- 🔒 [Administrator Guide](file:///g:/GitHub/BIT/My-Projects/docs/ADMIN_GUIDE.md)
- 📡 [REST API Documentation](file:///g:/GitHub/BIT/My-Projects/docs/API_DOCUMENTATION.md)
- 📋 [Requirements Traceability Matrix](file:///g:/GitHub/BIT/My-Projects/docs/REQUIREMENTS_TRACEABILITY.md)
