# User Guide: Local Tourist Day-Visit Planner and Information System

**Project Title:** Local Tourist Day-Visit Planner and Information System  
**Target Region:** Sammanthurai and Surrounding Areas (within 25 km radius), Eastern Province, Sri Lanka  
**Academic Module:** ITE2953 – Programming Group Project 25S2  
**Author:** Ahmed ALL (Registration No: E2410186)  

---

## 1. Introduction & Product Overview

The **Local Tourist Day-Visit Planner and Information System** is an intuitive, web-based tourism directory and itinerary builder. It consolidates scattered travel details—including exact locations, travel distances, visiting hours, cultural dress codes, and estimated visiting times—for key attractions within 25 km of Sammanthurai.

### What You Can Do
1. **Browse Attractions:** View a curated selection of places across Religious, Heritage, Nature, Beach, Educational, Landmark, and Recreation categories.
2. **Search by Keyword:** Instantly locate attractions by name, keyword, or locality.
3. **Filter by Category:** Narrow results with category pills (e.g., Beach, Nature, Religious).
4. **View Detailed Place Information:** Access opening times, travel tips, visitor etiquette, and high-resolution visuals.
5. **Explore on Interactive Maps:** Inspect individual place coordinates or view all destinations together on the Overview Map with a 25 km perimeter indicator.
6. **Build a One-Day Visit Itinerary:** Add attractions, reorder stops with Move Up/Down controls, calculate total visit times, and print a formatted schedule for your journey.

---

## 2. Navigating the Public Website

The top navigation bar appears on every page:
- **Home:** Featured attractions, category explorer, instant search, and planning steps.
- **Attractions:** The complete catalog with search, category filtering, and sorting options.
- **Visit Planner:** Your customized one-day itinerary with an active stop counter badge.
- **Overview Map:** Geospatial view of all attractions around Sammanthurai.
- **Admin Portal:** Secure login for tourism officers.

---

## 3. Browsing, Searching & Filtering (FR-1.1, FR-1.2, FR-1.3, FR-2.1, FR-2.2, FR-2.3)

### 3.1 Searching for an Attraction
1. Open the [Attractions Page](file:///g:/GitHub/BIT/My-Projects/public/places.html) or use the search bar on the Home Page.
2. Enter a keyword (e.g., `Masjid`, `Lighthouse`, `Oluvil`, or `Beach`) in the search box.
3. Press <kbd>Enter</kbd> or click the **Search** button.
4. If no places match your search term, the system displays a clear **"No results found"** feedback message with a button to reset your filters.

### 3.2 Filtering by Category
1. Click any category pill (e.g., **Beach**, **Nature**, **Religious**, or **Landmark**) above the grid.
2. The list updates immediately to display attractions in the selected category.
3. To view all places again, click **All** or use the **✕ Clear Filters** button.

### 3.3 Sorting Results
Use the dropdown to sort attractions by:
- **Distance: Nearest First** (default, sorting from closest to farthest from Sammanthurai)
- **Distance: Furthest First**
- **Name: Alphabetical (A to Z)**
- **Duration: Shortest Visit**

---

## 4. Viewing Attraction Details & Maps (FR-3.1, FR-3.2, FR-3.3, FR-4.1, FR-4.2)

1. Click **Details** on any attraction card to open its dedicated page.
2. On the details page, you will find:
   - **Visual Asset:** High-resolution illustration/photo of the attraction.
   - **Key Information:** Category, approximate distance from Sammanthurai, opening/closing hours, and estimated visit duration.
   - **Full Description:** Historical context, architectural notes, and cultural significance.
   - **Local Travel Tips:** Best visiting hours, parking advice, and practical reminders.
   - **Visitor Guidelines & Etiquette:** Dress code requirements (such as removing footwear at sacred sites), photography permissions, and environmental cleanliness rules.
   - **Integrated Interactive Map:** Centered on the site's latitude and longitude.
   - **External Map Link:** Click **Open in Google Maps ↗** for turn-by-turn driving or walking directions.

---

## 5. Building Your One-Day Visit Plan (FR-5.1, FR-5.2, FR-5.3, FR-5.4)

### 5.1 Adding Attractions to Your Plan
- On any attraction card or detail page, click **+ Add to Plan**.
- A toast notification confirms addition, and the planner badge updates.
- If an attraction is already in your itinerary, the button displays **✓ In Plan**.

### 5.2 Reordering Itinerary Stops
1. Navigate to the [Visit Planner Page](file:///g:/GitHub/BIT/My-Projects/public/planner.html).
2. Each stop displays a numbered badge indicating its sequence.
3. Click the **▲ (Move Up)** button to move a stop earlier in the day.
4. Click the **▼ (Move Down)** button to move a stop later in the day.
5. The top item's Up button and bottom item's Down button are disabled automatically.

### 5.3 Removing Stops or Clearing the Plan
- To remove an individual stop: Click the **✕** button on that attraction's card.
- To reset the entire itinerary: Click the red **Clear Plan** button at the top right and confirm the prompt.

### 5.4 Duration Tracking & Suggested Day Timeline
- The planner calculates the **Total Estimated Visit Time** in hours and minutes.
- The sidebar displays a **Suggested Timeline** starting at 08:30 AM, budgeting visit durations plus realistic travel buffers between stops.

### 5.5 Printing or Saving as PDF
1. Click **🖨️ Print Itinerary** in the planner header or summary panel.
2. A clean, printer-optimized document layout is generated with your stops, travel tips, and timetable.
3. Select your physical printer or choose **"Save as PDF"** in your browser's print dialog.

### 5.6 Sharing Itineraries
Click **🔗 Save & Generate Share Link** to persist the plan to the database and generate a shareable URL to send to family or friends.
