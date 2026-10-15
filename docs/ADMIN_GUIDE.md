# Administrator Guide: Local Tourist Day-Visit Planner and Information System

**Project Title:** Local Tourist Day-Visit Planner and Information System  
**Audience:** System Administrators & Tourism Information Officers  
**Academic Module:** ITE2953 – Programming Group Project 25S2  
**Author:** Ahmed ALL (Registration No: E2410186)  

---

## 1. Overview of Administrative Functions

The Administrator module provides authorized tourism officers with tools to maintain up-to-date tourist attraction records and attraction categories for Sammanthurai and its surrounding 25 km radius.

Key administrator capabilities:
- **Authentication (FR-6.1 – FR-6.3):** Session-based login, rate-limited against brute force, and secure logout.
- **Attraction Record Management (FR-7.1 – FR-7.4):** Add, update, and delete attractions with strict validation and a 25 km distance constraint.
- **Category Management (FR-8.1 – FR-8.3):** Add, edit, and delete attraction categories, with referential integrity protecting assigned categories from deletion.

---

## 2. Administrator Account Setup & Security

### 2.1 Default Initial Account
After initializing the database via `npm run db:init`, the system creates a default initial administrator:
- **Email:** `admin@touristplanner.local`
- **Password:** `admin123`
- **Storage:** Stored in the MySQL `admins` table as a salted `bcrypt` hash (`$2a$10$...`). Plain text passwords are never stored.

### 2.2 Creating a Custom Administrator
Run the dedicated administrator creation script in your terminal:
```bash
npm run admin:create
```
Follow the interactive prompts to enter:
1. Full Name (minimum 2 characters)
2. Email Address (validated against standard RFC email format)
3. Password (minimum 6 characters)

The script automatically hashes the password with 10 rounds of `bcrypt` salting before persisting the record.

---

## 3. Logging In & Session Management (FR-6.1, FR-6.2, FR-6.3)

1. Navigate to: `http://localhost:3000/admin/login.html`
2. Enter your registered email address and password.
3. Click **Secure Log In →**.
4. **Validation & Errors (FR-6.2):** If an invalid email or password is entered, the login form displays an error message: *"Invalid email address or password. Please try again."*
5. **Brute-Force Rate Limiting:** The backend rate limiter allows a maximum of 15 login attempts per 15-minute window per IP address before temporary lockout.
6. **Logging Out (FR-6.3):** Click **Logout** at the bottom of the admin sidebar or top navigation. Your session is terminated immediately and the session cookie is destroyed.

---

## 4. Tourist Place Management (FR-7.1 – FR-7.4)

### 4.1 Adding a New Tourist Place (FR-7.1, FR-7.4)
1. On the Admin Dashboard, click **+ Add Place** in the top bar or places section.
2. Complete the form fields:
   - **Place Name** *(Required)*: Official title of the destination.
   - **Category** *(Required)*: Select from existing categories (e.g., Religious, Nature, Beach).
   - **Location / Address** *(Required)*: Street address or village locality.
   - **Distance from Sammanthurai (km)** *(Required)*: Must be between `0.0` and `25.0` km.
   - **Opening Time / Closing Time**: e.g., `06:00 AM` and `06:00 PM`.
   - **Estimated Duration (Minutes)**: Realistic visit time for itinerary estimation (e.g., 45, 60, 90 mins).
   - **Latitude & Longitude**: Decimal GPS coordinates (e.g., `7.3615`, `81.8025`).
   - **Image URL / Path**: Relative image path (e.g., `/images/places/sammanthurai-grand-masjid.svg`).
   - **Description** *(Required)*: Thorough summary of the attraction.
   - **Travel Tips**: Advice regarding best visit hours, parking, or refreshments.
   - **Visitor Guidelines & Etiquette**: Dress code, footwear etiquette, photography rules, or safety guidelines.
3. Click **Save Record**. The new attraction immediately appears in the public catalog and admin tables.

### 4.2 Updating an Existing Place (FR-7.2)
1. In the Tourist Attraction Records table, click the **Edit** button next to the desired place.
2. The modal populates with current information.
3. Modify any attributes and click **Save Record**.

### 4.3 Deleting a Tourist Place (FR-7.3)
1. Click **Delete** next to the place in the table.
2. A confirmation dialog prompts: *"Are you sure you want to permanently delete the tourist place '...'? This action cannot be undone."*
3. Click **Delete Permanently** to confirm.

---

## 5. Category Management (FR-8.1 – FR-8.3)

### 5.1 Adding a Category (FR-8.1)
1. Under **Attraction Categories**, click **+ Add Category**.
2. Enter the new category name (e.g., `Eco-Park` or `Historical Monument`).
3. Click **Save Category**.

### 5.2 Editing a Category (FR-8.2)
1. Click **Edit** next to any category.
2. Modify the name and click **Save Category**.

### 5.3 Deleting a Category & Referential Integrity (FR-8.3)
- SRS requirement FR-8.3 states: *"The system shall allow the administrator to delete a category that is not currently assigned to any tourist place."*
- If an administrator clicks **Delete** on a category that currently has 1 or more places assigned (e.g., `Religious` which has 2 places), the system blocks deletion and displays an alert:
  > *"Cannot delete category 'Religious' because it is currently assigned to 2 tourist attraction(s). Please reassign or delete those attractions first."*
- Unused categories can be safely deleted after confirmation.
