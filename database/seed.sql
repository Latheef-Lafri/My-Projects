-- ========================================================
-- Local Tourist Day-Visit Planner and Information System
-- Seed Data: seed.sql
-- Contains:
-- 1. 7 Official Tourist Categories
-- 2. 10 Proposed Tourist Attractions (all validated <= 25km radius from Sammanthurai)
-- 3. Default Initial Administrator (email: admin@touristplanner.local, password: admin123)
-- Author: Ahmed ALL (E2410186)
-- ========================================================

USE `tourist_planner_db`;

-- Insert Initial Categories (FR-2.1, FR-8.1)
INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Religious'),
(2, 'Heritage'),
(3, 'Nature'),
(4, 'Beach'),
(5, 'Educational'),
(6, 'Landmark'),
(7, 'Recreation')
ON DUPLICATE KEY UPDATE `category_name` = VALUES(`category_name`);

-- Insert Default Administrator
-- Default credentials: admin@touristplanner.local / admin123
INSERT INTO `admins` (`admin_id`, `name`, `email`, `password_hash`) VALUES
(1, 'System Administrator', 'admin@touristplanner.local', '$2a$10$OUYY6ryM0wPwMDoxzpjJSuqZ4kBbGU7Z.97PoQzwKqSfbenEmND/i')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert 10 Proposed Tourist Places (Proposal Section 1.8 & SRS Section 4)
-- Distance verified from central Sammanthurai (within 25 km radius limit)
INSERT INTO `tourist_places` (
  `place_id`, 
  `place_name`, 
  `category_id`, 
  `description`, 
  `location`, 
  `opening_time`, 
  `closing_time`, 
  `distance_km`, 
  `travel_tips`, 
  `visitor_guidelines`, 
  `estimated_duration_minutes`, 
  `latitude`, 
  `longitude`, 
  `image_url`
) VALUES
(
  1,
  'Sammanthurai Grand Masjid',
  1,
  'A historically important mosque in Sammanthurai renowned for its distinctive Islamic architectural elements and deep cultural importance. It stands as a cornerstone of the spiritual and communal identity of Sammanthurai.',
  'Hijra Road, Sammanthurai, Eastern Province',
  '04:30 AM',
  '09:30 PM',
  1.00,
  'Modest dress is required for all visitors. Please remove footwear prior to entering prayer halls. Respect prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha).',
  'Maintain silence in and around prayer areas. Photography should be conducted politely with permission from trustees.',
  45,
  7.3615000,
  81.8025000,
'/images/places/sammanthurai-grand-masjid.jpg'
),
(
  2,
  'Muhaiyaddeen Jumma Masjid, Kalmunai',
  1,
  'A celebrated historic mosque located in the coastal city of Kalmunai. Famous for its classic coastal Islamic architecture, ornate minarets, and profound role in the community life of the region.',
  'Main Street, Kalmunai, Eastern Province',
  '04:30 AM',
  '09:00 PM',
  14.00,
  'Best visited outside peak Friday congregational prayers (Jummah 12:00 - 13:30) for quiet sightseeing. Modest clothing covering arms and legs is compulsory.',
  'Remove footwear at the entrance. Keep electronic devices on silent. Ask local guides for permission before recording video.',
  45,
  7.4168000,
  81.8294000,
  '/images/places/muhaiyaddeen-masjid.jpg'
),
(
  3,
  'Chadayanthalava',
  3,
  'A peaceful natural reservoir and rock formation retreat ideal for family picnics, bird watching, and unwinding amidst serene rural greenery and ancient agricultural tank vistas.',
  'Chadayanthalava Tank, Ampara District',
  '06:00 AM',
  '06:00 PM',
  18.00,
  'Carry drinking water, sun hats, and packed refreshments as commercial shops nearby are limited. Comfortable walking or trekking shoes are recommended for rock climbing.',
  'Do not litter or dispose of plastics into the tank or surrounding scrublands. Avoid venturing into deep water unsupervised.',
  90,
  7.3480000,
  81.6750000,
  '/images/places/chadayanthalava.jpg'
),
(
  4,
  'Painthaaru',
  3,
  'A scenic freshwater stream and bathing spot surrounded by lush paddy and canal waterways, known for cool running waters especially during and after regional rainy seasons.',
  'Painthaaru Stream, Karaitivu-Sammanthurai border',
  '06:00 AM',
  '06:00 PM',
  16.00,
  'Morning hours or mid-afternoon provide the best natural light and gentle temperature. Bring a change of dry clothes if you intend to bathe.',
  'Check water flow speed and depth before bathing, especially after monsoon rainfall. Respect neighboring agricultural plots and do not wash vehicles in clean stream areas.',
  60,
  7.3850000,
  81.7820000,
  '/images/places/painthaaru.svg'
),
(
  5,
  'Kalmunai Beach',
  4,
  'A sweeping stretch of golden sand along the Indian Ocean in Kalmunai. A prime destination for sunrise gazing, taking long breezy strolls, and watching local artisanal fishing boats ashore.',
  'Coastal Road, Kalmunai',
  '05:30 AM',
  '07:00 PM',
  14.00,
  'Arrive early between 05:45 and 06:30 AM to witness magnificent sunrise colors over the Bay of Bengal and observe fishermen drawing shore nets.',
  'Open sea currents on the east coast can be unpredictable; swim only in designated tranquil shore sections. Avoid leaving trash on the beachfront.',
  75,
  7.4150000,
  81.8385000,
  '/images/places/kalmunai-beach.svg'
),
(
  6,
  'South Eastern University of Sri Lanka',
  5,
  'A distinguished national university located in Oluvil. The campus features modern academic architecture, spacious palm-lined avenues, libraries, and an inspiring coastal learning environment.',
  'University Park, Oluvil',
  '08:30 AM',
  '05:00 PM',
  8.00,
  'Visitors must produce national identification at the security checkpoint upon entry. Weekdays offer the best opportunity to experience campus life.',
  'Respect academic zones and refrain from loud behavior near lecture auditoriums and examination centers.',
  60,
  7.2965000,
  81.8505000,
  '/images/places/seusl.svg'
),
(
  7,
  'Oluvil Harbour',
  6,
  'An impressive maritime and fishery harbor built along the Oluvil coastline, offering sweeping views of breakwaters, berthed vessels, and the vibrant coastal fishery trade.',
  'Oluvil Coast, Eastern Province',
  '06:00 AM',
  '06:00 PM',
  10.00,
  'Bring sunglasses and sun protection as coastal sea reflections are bright. Check with port gate marshals regarding authorized scenic perimeter pathways.',
  'Adhere strictly to harbor security directives; never cross warning barriers or walk on wet submerged breakwater dolosses.',
  45,
  7.2885000,
  81.8670000,
  '/images/places/oluvil-harbour.svg'
),
(
  8,
  'Oluvil Lighthouse',
  6,
  'A picturesque 24-meter tall coastal lighthouse built in 1999 on the Oluvil shoreline. Provides scenic ocean vistas, maritime heritage charm, and top-tier photography opportunities.',
  'Oluvil Beachfront, Oluvil',
  '06:00 AM',
  '06:30 PM',
  10.00,
  'Golden hour before dusk (17:00 - 18:15) offers phenomenal lighting for photography against the white lighthouse tower and sea surf.',
  'The internal staircase may have restricted access; enjoy the exterior grounds responsibly. Watch footing on sandy coastal ridges.',
  45,
  7.2892000,
  81.8680000,
  '/images/places/oluvil-lighthouse.svg'
),
(
  9,
  'Oluvil Beach',
  4,
  'A tranquil and unspoiled coastal beach fringed with coastal casuarina trees and sand dunes, ideal for peace-seekers, gentle beach walks, and relaxing ocean soundscapes.',
  'Oluvil Coast Road, Oluvil',
  '05:30 AM',
  '06:30 PM',
  10.00,
  'A quieter alternative to urban beaches. Great for peaceful reading or contemplative morning walks. Carry drinking water and snacks.',
  'Take all disposable items back with you. Beware of high surf during seasonal wind changes.',
  60,
  7.2930000,
  81.8640000,
  '/images/places/oluvil-beach.svg'
),
(
  10,
  'Green Park, Ampara',
  7,
  'A beautifully landscaped public recreational park near Ampara Tank. Features paved walking loops, shady canopy trees, family sitting areas, and playground facilities.',
  'Inginiyagala Road, Near Ampara Tank, Ampara',
  '06:00 AM',
  '07:30 PM',
  22.00,
  'Great place for family outings and relaxation at the end of a touring day. Late afternoons provide a pleasant lakeside breeze.',
  'A nominal municipal entry fee may apply at the entrance booth. Keep the gardens tidy and follow playground safety rules.',
  90,
  7.2890000,
  81.6720000,
  '/images/places/green-park-ampara.svg'
)
ON DUPLICATE KEY UPDATE 
  `place_name` = VALUES(`place_name`),
  `category_id` = VALUES(`category_id`),
  `description` = VALUES(`description`),
  `location` = VALUES(`location`),
  `opening_time` = VALUES(`opening_time`),
  `closing_time` = VALUES(`closing_time`),
  `distance_km` = VALUES(`distance_km`),
  `travel_tips` = VALUES(`travel_tips`),
  `visitor_guidelines` = VALUES(`visitor_guidelines`),
  `estimated_duration_minutes` = VALUES(`estimated_duration_minutes`),
  `latitude` = VALUES(`latitude`),
  `longitude` = VALUES(`longitude`),
  `image_url` = VALUES(`image_url`);
