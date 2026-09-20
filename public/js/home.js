/**
 * Local Tourist Day-Visit Planner and Information System
 * Home Page Controller: public/js/home.js
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const placesGrid = document.getElementById('home-places-grid');
  const categoryPillsContainer = document.getElementById('home-category-pills');
  const statPlacesCount = document.getElementById('stat-places-count');
  const statCategoriesCount = document.getElementById('stat-categories-count');

  let activeCategory = '';

  // 1. Fetch initial statistics and categories
  try {
    const categoriesRes = await API.getCategories();
    if (categoriesRes.success && categoriesRes.data) {
      if (statCategoriesCount) {
        statCategoriesCount.textContent = categoriesRes.count;
      }
      renderCategoryPills(categoriesRes.data);
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  // 2. Load places
  await loadHomePlaces();

  // Setup pill click listeners
  function renderCategoryPills(categories) {
    if (!categoryPillsContainer) return;
    
    let html = `<button class="filter-pill ${activeCategory === '' ? 'active' : ''}" data-category="">All Categories</button>`;
    categories.forEach(cat => {
      html += `
        <button class="filter-pill ${String(activeCategory) === String(cat.category_id) ? 'active' : ''}" data-category="${cat.category_id}">
          ${escapeHtml(cat.category_name)}
        </button>
      `;
    });
    categoryPillsContainer.innerHTML = html;

    categoryPillsContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        categoryPillsContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category || '';
        await loadHomePlaces(activeCategory);
      });
    });
  }

  // Fetch and display places
  async function loadHomePlaces(categoryId = '') {
    if (!placesGrid) return;
    placesGrid.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center; grid-column: 1 / -1;">
        <p style="color: var(--text-muted);">Fetching attractions...</p>
      </div>
    `;

    try {
      const response = await API.getPlaces({ category: categoryId });
      const places = response.data || [];

      if (statPlacesCount && !categoryId) {
        statPlacesCount.textContent = places.length;
      }

      if (places.length === 0) {
        placesGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🏖️</div>
            <h3 class="empty-state-title">No attractions found</h3>
            <p class="empty-state-desc">There are no attractions listed under this category yet.</p>
            <button class="btn btn-secondary btn-sm" id="btn-reset-home-cat">Reset Filter</button>
          </div>
        `;
        document.getElementById('btn-reset-home-cat')?.addEventListener('click', () => {
          categoryPillsContainer.querySelector('[data-category=""]')?.click();
        });
        return;
      }

      // Render cards
      placesGrid.innerHTML = places.map(place => createPlaceCardHtml(place)).join('');

      // Attach add-to-plan event listeners
      placesGrid.querySelectorAll('.btn-add-plan').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const placeId = parseInt(btn.dataset.id, 10);
          const place = places.find(p => p.place_id === placeId);
          if (place) {
            const result = PlanStorage.addPlace(place);
            if (result.success) {
              showToast(result.message, 'success');
              btn.innerHTML = '✓ In Plan';
              btn.classList.remove('btn-secondary');
              btn.classList.add('btn-outline-primary');
            } else {
              showToast(result.message, 'info');
            }
          }
        });
      });
    } catch (err) {
      console.error('Failed to load places:', err);
      placesGrid.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center; grid-column: 1 / -1; border-color: rgba(244, 63, 94, 0.4);">
          <p style="color: #fda4af;">Failed to load tourist attractions. Please check server connection.</p>
        </div>
      `;
    }
  }

  function createPlaceCardHtml(place) {
    const inPlan = PlanStorage.isInPlan(place.place_id);
    const imgUrl = place.image_url || '/images/places/placeholder.svg';
    const durationFormatted = PlanStorage.formatDuration(place.estimated_duration_minutes || 60);

    return `
      <div class="card place-card" id="place-card-${place.place_id}">
        <div class="place-card-image-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(place.place_name)}" class="place-card-image" loading="lazy">
          <span class="place-category-badge">${escapeHtml(place.category_name)}</span>
          <span class="place-distance-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${place.distance_km} km
          </span>
        </div>
        <div class="place-card-body">
          <h3 class="place-card-title">${escapeHtml(place.place_name)}</h3>
          <div class="place-card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${escapeHtml(place.location)}
          </div>
          <p class="place-card-desc">${escapeHtml(place.description)}</p>
          <div class="place-card-meta">
            <span>⏱️ Visit: ~${durationFormatted}</span>
            <span>🕒 ${escapeHtml(place.opening_time)} - ${escapeHtml(place.closing_time)}</span>
          </div>
          <div class="place-card-actions">
            <a href="/place-details.html?id=${place.place_id}" class="btn btn-secondary btn-sm" id="btn-view-details-${place.place_id}">
              Details
            </a>
            <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-secondary'} btn-sm btn-add-plan" 
                    data-id="${place.place_id}" 
                    id="btn-plan-${place.place_id}">
              ${inPlan ? '✓ In Plan' : '+ Add to Plan'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Listen to plan updates across windows/components
  window.addEventListener('planUpdated', () => {
    document.querySelectorAll('.btn-add-plan').forEach(btn => {
      const id = parseInt(btn.dataset.id, 10);
      if (PlanStorage.isInPlan(id)) {
        btn.innerHTML = '✓ In Plan';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-outline-primary');
      } else {
        btn.innerHTML = '+ Add to Plan';
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-secondary');
      }
    });
  });
});
