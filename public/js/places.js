/**
 * Local Tourist Day-Visit Planner and Information System
 * Attractions Catalog Controller: public/js/places.js
 * Implements FR-1.1, FR-1.2, FR-1.3, FR-2.1, FR-2.2, FR-2.3
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const placesGrid = document.getElementById('places-grid');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search-trigger');
  const sortSelect = document.getElementById('sort-select');
  const categoryPillsContainer = document.getElementById('category-filter-pills');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  const resultsCountFeedback = document.getElementById('results-count-feedback');
  const activeFilterTags = document.getElementById('active-filter-tags');

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  let currentSearch = urlParams.get('search') || '';
  let currentCategory = urlParams.get('category') || '';
  let currentSort = sortSelect ? sortSelect.value : 'distance_km:ASC';

  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }

  // 1. Fetch Categories for Filter Bar
  try {
    const catRes = await API.getCategories();
    if (catRes.success && catRes.data) {
      renderCategoryPills(catRes.data);
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // 2. Fetch Places
  await fetchAndRenderPlaces();

  // Search input listeners
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        currentSearch = searchInput.value.trim();
        fetchAndRenderPlaces();
      }
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      currentSearch = searchInput ? searchInput.value.trim() : '';
      fetchAndRenderPlaces();
    });
  }

  // Sort listener
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      fetchAndRenderPlaces();
    });
  }

  // Clear filters listener (FR-2.3)
  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
      currentSearch = '';
      currentCategory = '';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'distance_km:ASC';
      currentSort = 'distance_km:ASC';

      // Update pill UI
      if (categoryPillsContainer) {
        categoryPillsContainer.querySelectorAll('.filter-pill').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === '');
        });
      }

      // Update browser URL without reload
      window.history.replaceState({}, '', '/places.html');

      fetchAndRenderPlaces();
    });
  }

  function renderCategoryPills(categories) {
    if (!categoryPillsContainer) return;

    let html = `<button class="filter-pill ${currentCategory === '' ? 'active' : ''}" data-category="">All</button>`;
    categories.forEach(cat => {
      const isSelected = String(currentCategory) === String(cat.category_id);
      html += `
        <button class="filter-pill ${isSelected ? 'active' : ''}" data-category="${cat.category_id}">
          ${escapeHtml(cat.category_name)}
        </button>
      `;
    });
    categoryPillsContainer.innerHTML = html;

    // Attach click handlers (FR-2.1, FR-2.2)
    categoryPillsContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryPillsContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category || '';
        fetchAndRenderPlaces();
      });
    });
  }

  async function fetchAndRenderPlaces() {
    if (!placesGrid) return;

    // Show loading
    placesGrid.innerHTML = `
      <div class="card" style="padding: 50px; text-align: center; grid-column: 1 / -1;">
        <p style="color: var(--text-muted);">Finding tourist attractions...</p>
      </div>
    `;

    // Parse sort
    const [sortBy, sortOrder] = currentSort.split(':');

    // Update Clear Filters button visibility
    const hasActiveFilters = Boolean(currentSearch || currentCategory);
    if (btnClearFilters) {
      btnClearFilters.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }

    try {
      const response = await API.getPlaces({
        search: currentSearch,
        category: currentCategory,
        sortBy,
        sortOrder
      });

      const places = response.data || [];

      // Update counter feedback
      if (resultsCountFeedback) {
        if (places.length === 0) {
          resultsCountFeedback.textContent = '0 attractions found.';
        } else {
          resultsCountFeedback.textContent = `Showing ${places.length} attraction${places.length > 1 ? 's' : ''}${hasActiveFilters ? ' matching your filters' : ''}`;
        }
      }

      // Update tags
      if (activeFilterTags) {
        const tags = [];
        if (currentSearch) tags.push(`Keyword: "${escapeHtml(currentSearch)}"`);
        if (currentCategory && categoryPillsContainer) {
          const activeBtn = categoryPillsContainer.querySelector(`.filter-pill[data-category="${currentCategory}"]`);
          if (activeBtn) tags.push(`Category: ${escapeHtml(activeBtn.textContent.trim())}`);
        }
        activeFilterTags.innerHTML = tags.map(t => `<span class="badge-count" style="margin-left: 6px;">${t}</span>`).join('');
      }

      // Handle Empty State (FR-1.3)
      if (places.length === 0) {
        placesGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">No results found</h3>
            <p class="empty-state-desc">
              We couldn't find any tourist attractions matching "${escapeHtml(currentSearch || 'your filter')}". 
              Try searching with different keywords or clear the category filters.
            </p>
            <button class="btn btn-primary btn-sm" id="btn-empty-clear">Clear All Filters</button>
          </div>
        `;

        document.getElementById('btn-empty-clear')?.addEventListener('click', () => {
          btnClearFilters?.click();
        });
        return;
      }

      // Render cards
      placesGrid.innerHTML = places.map(place => createPlaceCardHtml(place)).join('');

      // Attach add-to-plan handlers
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
        <div class="card" style="padding: 40px; text-align: center; grid-column: 1 / -1; border-color: #fca5a5; background-color: var(--danger-light);">
          <p style="color: var(--danger);">Unable to retrieve attractions from server. Please verify your connection.</p>
        </div>
      `;
    }
  }

  function createPlaceCardHtml(place) {
    const inPlan = PlanStorage.isInPlan(place.place_id);
    // Use the image URL as provided; if it lacks the folder path, prepend it.
    const imgUrl = place.image_url ? (place.image_url.startsWith('/images/places/') ? place.image_url : `/images/places/${place.image_url}`) : '/images/places/placeholder.svg';
    const durationFormatted = PlanStorage.formatDuration(place.estimated_duration_minutes || 60);
    const hoursFormatted = (place.opening_time && place.closing_time)
      ? `${escapeHtml(place.opening_time)} – ${escapeHtml(place.closing_time)}`
      : 'Daylight visit';

    return `
      <div class="card place-card" id="place-card-${place.place_id}">
        <div class="place-card-image-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(place.place_name)}" class="place-card-image" loading="lazy">
          <span class="place-category-badge">${escapeHtml(place.category_name)}</span>
          <span class="place-distance-badge">
            ${place.distance_km} km
          </span>
        </div>
        <div class="place-card-body">
          <h3 class="place-card-title">${escapeHtml(place.place_name)}</h3>
          <div class="place-card-location">
            📍 ${escapeHtml(place.location || 'Sammanthurai')}
          </div>
          <p class="place-card-desc">${escapeHtml(place.description)}</p>
          <div class="place-card-meta">
            <span><strong>Visit:</strong> ~${durationFormatted}</span>
            <span><strong>Hours:</strong> ${hoursFormatted}</span>
          </div>
          <div class="place-card-actions">
            <a href="/place-details.html?id=${place.place_id}" class="btn btn-secondary btn-sm" id="btn-view-details-${place.place_id}">
              View Details
            </a>
            <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-primary'} btn-sm btn-add-plan" 
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
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
      } else {
        btn.innerHTML = '+ Add to Plan';
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary');
      }
    });
  });
});
