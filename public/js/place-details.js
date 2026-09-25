/**
 * Local Tourist Day-Visit Planner and Information System
 * Attraction Details Controller: public/js/place-details.js
 * Implements FR-3.1, FR-3.2, FR-3.3, FR-4.1
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('details-render-area');
  const topPlanAction = document.getElementById('top-plan-action');

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = parseInt(urlParams.get('id'), 10);

  if (!placeId || isNaN(placeId)) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3 class="empty-state-title">Invalid Attraction ID</h3>
        <p class="empty-state-desc">No valid attraction ID was specified in the link.</p>
        <a href="/places.html" class="btn btn-primary btn-sm">Return to Catalog</a>
      </div>
    `;
    return;
  }

  try {
    const res = await API.getPlaceById(placeId);
    if (!res.success || !res.data) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❓</div>
          <h3 class="empty-state-title">Attraction Not Found</h3>
          <p class="empty-state-desc">The requested attraction could not be found in our database.</p>
          <a href="/places.html" class="btn btn-primary btn-sm">Browse Attractions</a>
        </div>
      `;
      return;
    }

    const place = res.data;
    document.title = `${place.place_name} - Sammanthurai Local Tourism`;

    renderPlaceDetails(place);
    await initializePlaceMap(place);
  } catch (err) {
    console.error('Failed to load attraction details:', err);
    container.innerHTML = `
      <div class="card" style="padding: 50px; text-align: center; border-color: rgba(244, 63, 94, 0.4);">
        <p style="color: #fda4af;">Failed to retrieve attraction details. Please check your connection.</p>
        <a href="/places.html" class="btn btn-secondary btn-sm" style="margin-top: 14px;">Return to Attractions</a>
      </div>
    `;
  }

  function renderPlaceDetails(place) {
    const inPlan = PlanStorage.isInPlan(place.place_id);
    const imgUrl = place.image_url || '/images/places/placeholder.svg';
    const durationFormatted = PlanStorage.formatDuration(place.estimated_duration_minutes || 60);
    const gmapsUrl = getGoogleMapsUrl(place.place_name, place.latitude, place.longitude, place.location);

    // Top action button
    if (topPlanAction) {
      topPlanAction.innerHTML = `
        <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-primary'} btn-sm" id="btn-top-add-plan">
          ${inPlan ? '✓ In One-Day Plan' : '+ Add to One-Day Plan'}
        </button>
      `;
      document.getElementById('btn-top-add-plan').addEventListener('click', () => togglePlan(place));
    }

    container.innerHTML = `
      <!-- Hero Image Banner (FR-3.2) -->
      <div class="place-detail-hero">
        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(place.place_name)}" class="place-detail-img">
        <div class="place-detail-overlay">
          <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
            <span class="place-category-badge" style="position: static;">${escapeHtml(place.category_name)}</span>
            <span class="place-distance-badge" style="position: static;">
              📍 ~${place.distance_km} km from Sammanthurai Town
            </span>
          </div>
          <h1 style="font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: #fff;">
            ${escapeHtml(place.place_name)}
          </h1>
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 1.05rem; margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${escapeHtml(place.location)}
          </p>
        </div>
      </div>

      <!-- Main Layout Grid (FR-3.1, FR-3.3, FR-4.1) -->
      <div class="place-detail-grid">
        <!-- Left Column: Details, Tips, Guidelines -->
        <div class="detail-left">
          <!-- Overview & Description (FR-3.1) -->
          <div class="detail-section">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About This Attraction
            </h2>
            <p style="color: var(--text-main); font-size: 1.05rem; line-height: 1.8; margin-top: 14px;">
              ${escapeHtml(place.description)}
            </p>
          </div>

          <!-- Travel Tips (FR-3.1) -->
          <div class="detail-section">
            <h3 style="color: var(--primary-light);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Local Travel Tips
            </h3>
            <div class="info-box">
              <div class="info-box-title">Important Recommendations for Day Visitors</div>
              <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6;">
                ${escapeHtml(place.travel_tips || 'Carry drinking water and sun protection. Please respect the local community and environment.')}
              </p>
            </div>
          </div>

          <!-- Visitor Guidelines (FR-3.3) -->
          <div class="detail-section">
            <h3 style="color: var(--accent-amber);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Visitor Guidelines &amp; Etiquette
            </h3>
            <div class="info-box info-box-amber">
              <div class="info-box-title">Cultural &amp; Safety Guidelines</div>
              <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6;">
                ${escapeHtml(place.visitor_guidelines || 'Maintain cleanliness and dispose of litter in designated bins. Follow site rules and local customs.')}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Key Details, Actions, Map (FR-4.1) -->
        <div class="detail-right">
          <!-- Quick Facts Table (FR-3.1, FR-3.3) -->
          <div class="detail-section">
            <h3>Visit Information</h3>
            <table class="meta-table">
              <tbody>
                <tr>
                  <td>Category</td>
                  <td>${escapeHtml(place.category_name)}</td>
                </tr>
                <tr>
                  <td>Distance</td>
                  <td>~${place.distance_km} km (Sammanthurai)</td>
                </tr>
                <tr>
                  <td>Opening Hours</td>
                  <td>${escapeHtml(place.opening_time)} - ${escapeHtml(place.closing_time)}</td>
                </tr>
                <tr>
                  <td>Est. Duration</td>
                  <td>~${durationFormatted}</td>
                </tr>
                <tr>
                  <td>Coordinates</td>
                  <td>
                    ${place.latitude && place.longitude ? `${place.latitude.toFixed(4)}° N, ${place.longitude.toFixed(4)}° E` : 'Available on request'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
              <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-primary'} btn-block" id="btn-side-add-plan">
                ${inPlan ? '✓ In Your One-Day Plan' : '+ Add to One-Day Plan'}
              </button>
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <!-- Integrated Location Map (FR-4.1) -->
          <div class="detail-section">
            <h3>Location Map</h3>
            <div id="place-map" class="map-frame" style="height: 320px;"></div>
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 10px; display: flex; justify-content: space-between;">
              <span>📍 ${escapeHtml(place.place_name)}</span>
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-light);">Directions ↗</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-side-add-plan').addEventListener('click', () => togglePlan(place));
  }

  function togglePlan(place) {
    if (PlanStorage.isInPlan(place.place_id)) {
      PlanStorage.removePlace(place.place_id);
      showToast(`Removed "${place.place_name}" from your visit plan.`, 'info');
    } else {
      const res = PlanStorage.addPlace(place);
      showToast(res.message, res.success ? 'success' : 'info');
    }
    renderPlaceDetails(place);
    initializePlaceMap(place);
  }

  // Initialize interactive map (FR-4.1)
  async function initializePlaceMap(place) {
    const mapElement = document.getElementById('place-map');
    if (!mapElement) return;

    const lat = place.latitude ? parseFloat(place.latitude) : 7.3620;
    const lng = place.longitude ? parseFloat(place.longitude) : 81.8037;

    // Check backend config for Google Maps API Key
    try {
      const config = await API.getConfig();
      if (config.google_maps_configured && config.google_maps_api_key && window.google?.maps) {
        // Render Google Map
        const gMap = new google.maps.Map(mapElement, {
          center: { lat, lng },
          zoom: 14,
          mapTypeId: 'roadmap',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
          ]
        });

        new google.maps.Marker({
          position: { lat, lng },
          map: gMap,
          title: place.place_name
        });
        return;
      }
    } catch (e) {
      // Fall through to Leaflet
    }

    // Leaflet OpenStreetMap fallback (guaranteed to render offline or without Google API Key)
    if (typeof L !== 'undefined') {
      mapElement.innerHTML = '';
      const map = L.map('place-map').setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${escapeHtml(place.place_name)}</b><br>${escapeHtml(place.location)}`).openPopup();
    } else {
      // Plain fallback card
      const gmapsUrl = getGoogleMapsUrl(place.place_name, lat, lng, place.location);
      mapElement.innerHTML = `
        <div class="map-placeholder-fallback">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🗺️</div>
          <h4 style="color: #fff; margin-bottom: 6px;">Interactive Map Location</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">
            Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
          </p>
          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Open in Google Maps ↗
          </a>
        </div>
      `;
    }
  }
});
