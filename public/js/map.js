/**
 * Local Tourist Day-Visit Planner and Information System
 * Overview Map Controller: public/js/map.js
 * Implements FR-4.2
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const mapCanvas = document.getElementById('overview-map-canvas');
  const categoryFilters = document.getElementById('map-category-filters');

  let allPlaces = [];
  let activeCategoryId = '';
  let leafletMap = null;
  let leafletMarkers = [];

  const centerLat = 7.3620;
  const centerLng = 81.8037;

  try {
    // 1. Fetch categories
    const catRes = await API.getCategories();
    if (catRes.success && catRes.data && categoryFilters) {
      catRes.data.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-pill';
        btn.dataset.category = cat.category_id;
        btn.textContent = cat.category_name;
        categoryFilters.appendChild(btn);
      });

      categoryFilters.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          categoryFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategoryId = btn.dataset.category || '';
          filterMapMarkers();
        });
      });
    }

    // 2. Fetch places
    const placesRes = await API.getPlaces();
    allPlaces = placesRes.data || [];

    // 3. Initialize Map (Google Maps or Leaflet Fallback)
    await initOverviewMap();
  } catch (err) {
    console.error('Failed to initialize overview map:', err);
    if (mapCanvas) {
      mapCanvas.innerHTML = `
        <div class="map-placeholder-fallback">
          <p style="color: var(--danger); font-weight: 500;">Unable to load map data. Please check connection.</p>
        </div>
      `;
    }
  }

  async function initOverviewMap() {
    if (!mapCanvas) return;

    // Check if Google Maps is configured
    try {
      const config = await API.getConfig();
      if (config.google_maps_configured && config.google_maps_api_key && window.google?.maps) {
        initGoogleOverviewMap();
        return;
      }
    } catch (e) {
      // Continue to Leaflet
    }

    initLeafletOverviewMap();
  }

  function initLeafletOverviewMap() {
    if (typeof L === 'undefined') {
      mapCanvas.innerHTML = '<div class="map-placeholder-fallback"><p>Map library not loaded.</p></div>';
      return;
    }

    mapCanvas.innerHTML = '';
    leafletMap = L.map('overview-map-canvas').setView([centerLat, centerLng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);

    // 25 km perimeter circle around Sammanthurai
    L.circle([centerLat, centerLng], {
      color: '#0ea5e9',
      fillColor: '#0ea5e9',
      fillOpacity: 0.05,
      radius: 25000 // 25,000 meters = 25 km
    }).addTo(leafletMap).bindPopup('<b>Sammanthurai 25 km Tourism Perimeter</b>');

    // Center Marker (Sammanthurai)
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: '<div style="background:#0ea5e9;color:#fff;font-weight:bold;padding:4px 8px;border-radius:12px;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);white-space:nowrap;">📍 Sammanthurai Center</div>',
      iconSize: [120, 30],
      iconAnchor: [60, 15]
    });
    L.marker([centerLat, centerLng], { icon: centerIcon }).addTo(leafletMap);

    // Render attraction markers
    renderLeafletMarkers();
  }

  function renderLeafletMarkers() {
    if (!leafletMap) return;

    // Clear previous markers
    leafletMarkers.forEach(m => leafletMap.removeLayer(m));
    leafletMarkers = [];

    const filtered = activeCategoryId
      ? allPlaces.filter(p => String(p.category_id) === String(activeCategoryId))
      : allPlaces;

    filtered.forEach(place => {
      const lat = place.latitude ? parseFloat(place.latitude) : null;
      const lng = place.longitude ? parseFloat(place.longitude) : null;
      if (!lat || !lng) return;

      const marker = L.marker([lat, lng]).addTo(leafletMap);

      const inPlan = PlanStorage.isInPlan(place.place_id);
      const imgUrl = place.image_url || '/uploads/placeholder.svg';
      const gmapsUrl = getGoogleMapsUrl(place.place_name, lat, lng, place.location);

      const popupHtml = `
        <div style="min-width: 200px; max-width: 240px; font-family: sans-serif; color: #1e293b;">
          <img src="${escapeHtml(imgUrl)}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" onerror="this.onerror=null;this.src='/uploads/placeholder.svg';">
          <h4 style="margin: 0 0 4px; font-size: 13px; color: #0f172a;">${escapeHtml(place.place_name)}</h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            <span>${escapeHtml(place.category_name)}</span> • <span>~${place.distance_km} km</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="/place-details.html?id=${place.place_id}" style="flex: 1; text-align: center; background: #0ea5e9; color: #fff; text-decoration: none; padding: 4px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
              Details
            </a>
            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f1f5f9; color: #0f172a; text-decoration: none; padding: 4px 6px; border-radius: 4px; font-size: 11px;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      leafletMarkers.push(marker);
    });
  }

  function filterMapMarkers() {
    renderLeafletMarkers();
  }

  function initGoogleOverviewMap() {
    // Placeholder for when Google Maps API script is present
    const gMap = new google.maps.Map(mapCanvas, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 11
    });

    new google.maps.Circle({
      strokeColor: '#0ea5e9',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#0ea5e9',
      fillOpacity: 0.05,
      map: gMap,
      center: { lat: centerLat, lng: centerLng },
      radius: 25000
    });

    allPlaces.forEach(p => {
      if (p.latitude && p.longitude) {
        new google.maps.Marker({
          position: { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) },
          map: gMap,
          title: p.place_name
        });
      }
    });
  }
});
