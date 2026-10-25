

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
      <div class="card" style="padding: 40px; text-align: center; border-color: #fca5a5; background-color: var(--danger-light);">
        <p style="color: var(--danger);">Failed to retrieve attraction details. Please check your connection.</p>
        <a href="/places.html" class="btn btn-secondary btn-sm" style="margin-top: 14px;">Return to Attractions</a>
      </div>
    `;
  }

  function renderPlaceDetails(place) {
    const inPlan = PlanStorage.isInPlan(place.place_id);
    let imgUrl = place.image_url || '/uploads/placeholder.svg';
    if (!imgUrl.startsWith('/') && !imgUrl.startsWith('http')) {
      imgUrl = `/uploads/places/${imgUrl}`;
    }
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

    const hoursDisplay = (place.opening_time && place.closing_time)
      ? `${escapeHtml(place.opening_time)} – ${escapeHtml(place.closing_time)}`
      : 'Not specified (Daylight visit recommended)';
    
    const coordsDisplay = (place.latitude && place.longitude)
      ? `${Number(place.latitude).toFixed(4)}° N, ${Number(place.longitude).toFixed(4)}° E`
      : 'Not specified';

    container.innerHTML = `
      <!-- Place Header & Image Banner (FR-3.2) -->
      <div class="place-detail-hero">
        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(place.place_name)}" class="place-detail-img" loading="lazy" onerror="this.onerror=null;this.src='/uploads/placeholder.svg';">
        <div class="place-detail-header">
          <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; align-items: center;">
            <span class="place-category-badge" style="position: static;">${escapeHtml(place.category_name)}</span>
            <span class="place-distance-badge" style="position: static;">
              📍 ~${place.distance_km} km from Sammanthurai Town
            </span>
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-heading); margin-bottom: 6px;">
            ${escapeHtml(place.place_name)}
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${escapeHtml(place.location || 'Sammanthurai region, Sri Lanka')}
          </p>
        </div>
      </div>

      <!-- Main Layout Grid (FR-3.1, FR-3.3, FR-4.1) -->
      <div class="place-detail-grid">
        <!-- Left Column: Details, Tips, Guidelines -->
        <div class="detail-left">
          <!-- Overview & Description (FR-3.1) -->
          <div class="detail-section">
            <h2>About This Attraction</h2>
            <p style="color: var(--text-main); font-size: 0.98rem; line-height: 1.7; margin-top: 10px;">
              ${escapeHtml(place.description)}
            </p>
          </div>

          <!-- Travel Tips (FR-3.1) -->
          <div class="detail-section">
            <h3>Local Travel Tips</h3>
            <div class="info-box">
              <div class="info-box-title">Recommendations for Day Visitors</div>
              <p style="color: var(--text-main); font-size: 0.92rem; line-height: 1.6;">
                ${escapeHtml(place.travel_tips || 'Carry drinking water and sun protection. Please respect the local community and surrounding environment.')}
              </p>
            </div>
          </div>

          <!-- Visitor Guidelines (FR-3.3) -->
          <div class="detail-section">
            <h3>Visitor Guidelines &amp; Etiquette</h3>
            <div class="info-box info-box-amber">
              <div class="info-box-title">Cultural &amp; Site Conduct</div>
              <p style="color: var(--text-main); font-size: 0.92rem; line-height: 1.6;">
                ${escapeHtml(place.visitor_guidelines || 'Maintain cleanliness and dispose of litter in designated bins. Observe site rules and local customs.')}
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
                  <td>~${place.distance_km} km (from Sammanthurai)</td>
                </tr>
                <tr>
                  <td>Opening Hours</td>
                  <td>${hoursDisplay}</td>
                </tr>
                <tr>
                  <td>Est. Duration</td>
                  <td>~${durationFormatted}</td>
                </tr>
                <tr>
                  <td>Coordinates</td>
                  <td>${coordsDisplay}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
              <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-primary'} btn-block" id="btn-side-add-plan">
                ${inPlan ? '✓ In Your One-Day Plan' : '+ Add to One-Day Plan'}
              </button>
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-block">
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <!-- Integrated Location Map (FR-4.1) -->
          <div class="detail-section">
            <h3>Location Map</h3>
            <div id="place-map" class="map-frame" style="height: 280px;"></div>
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 8px; display: flex; justify-content: space-between;">
              <span>📍 ${escapeHtml(place.place_name)}</span>
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
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
