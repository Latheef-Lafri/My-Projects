/**
 * Local Tourist Day-Visit Planner and Information System
 * Admin Dashboard Controller: public/js/admin.js
 * Implements FR-6.3, FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-8.1, FR-8.2, FR-8.3
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const statTotalPlaces = document.getElementById('stat-total-places');
  const statTotalCategories = document.getElementById('stat-total-categories');
  const tbodyPlaces = document.getElementById('tbody-places');
  const tbodyCategories = document.getElementById('tbody-categories');
  const adminPlacesSearch = document.getElementById('admin-places-search');
  const adminCategoryFilter = document.getElementById('admin-category-filter');
  const adminUserName = document.getElementById('admin-user-name');
  const adminUserEmail = document.getElementById('admin-user-email');
  const adminAvatarInitial = document.getElementById('admin-avatar-initial');
  const btnLogout = document.getElementById('btn-admin-logout');

  // Modals
  const modalPlaceForm = document.getElementById('modal-place-form');
  const formManagePlace = document.getElementById('form-manage-place');
  const modalPlaceTitle = document.getElementById('modal-place-title');
  const placeModalErrors = document.getElementById('place-modal-errors');

  const modalCategoryForm = document.getElementById('modal-category-form');
  const formManageCategory = document.getElementById('form-manage-category');
  const modalCatTitle = document.getElementById('modal-cat-title');
  const catModalErrors = document.getElementById('cat-modal-errors');

  const modalDeleteConfirm = document.getElementById('modal-delete-confirm');
  const deletePromptText = document.getElementById('delete-prompt-text');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  // State
  let cachedPlaces = [];
  let cachedCategories = [];
  let deleteAction = null; // callback function for modal confirmation

  // 1. Verify Authentication & Session
  try {
    const authRes = await API.getMe();
    if (!authRes.authenticated || !authRes.admin) {
      window.location.href = '/admin/login.html?session_expired=1';
      return;
    }

    if (adminUserName) adminUserName.textContent = authRes.admin.name || 'Admin';
    if (adminUserEmail) adminUserEmail.textContent = authRes.admin.email || '';
    if (adminAvatarInitial) adminAvatarInitial.textContent = (authRes.admin.name || 'A')[0].toUpperCase();
  } catch (err) {
    window.location.href = '/admin/login.html?session_expired=1';
    return;
  }

  // 2. Setup Logout (FR-6.3)
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await API.logout();
        showToast('Logged out successfully.', 'info');
        setTimeout(() => {
          window.location.href = '/admin/login.html';
        }, 500);
      } catch (err) {
        window.location.href = '/admin/login.html';
      }
    });
  }

  // 3. Load Initial Data
  await refreshDashboardData();

  // Search & Filter listeners
  if (adminPlacesSearch) {
    adminPlacesSearch.addEventListener('input', () => filterPlacesTable());
  }
  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', () => filterPlacesTable());
  }

  // 4. Modal Event Listeners
  setupPlaceModalHandlers();
  setupCategoryModalHandlers();
  setupDeleteModalHandlers();
  setupSidebarNavigation();

  function formatDurationSafe(minutes) {
    if (typeof PlanStorage !== 'undefined' && PlanStorage && PlanStorage.formatDuration) {
      return PlanStorage.formatDuration(minutes);
    }
    const m = parseInt(minutes, 10) || 60;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`;
    if (hours > 0) return `${hours} hr`;
    return `${mins} mins`;
  }

  function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .sidebar-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    });
  }

  /**
   * Refresh all dashboard tables and metrics
   */
  async function refreshDashboardData() {
    try {
      const [placesRes, categoriesRes] = await Promise.all([
        API.getPlaces(),
        API.getCategories()
      ]);

      cachedPlaces = placesRes.data || [];
      cachedCategories = categoriesRes.data || [];

      // Update counters
      if (statTotalPlaces) statTotalPlaces.textContent = cachedPlaces.length;
      if (statTotalCategories) statTotalCategories.textContent = cachedCategories.length;

      // Populate filter dropdowns
      populateCategorySelects();

      // Render Tables
      renderPlacesTable(cachedPlaces);
      renderCategoriesTable(cachedCategories);
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
      showToast('Error refreshing data from server.', 'error');
    }
  }

  function populateCategorySelects() {
    // 1. Filter dropdown
    if (adminCategoryFilter) {
      const current = adminCategoryFilter.value;
      adminCategoryFilter.innerHTML = '<option value="">All Categories</option>' +
        cachedCategories.map(c => `<option value="${c.category_id}">${escapeHtml(c.category_name)}</option>`).join('');
      adminCategoryFilter.value = current;
    }

    // 2. Place modal category select
    const placeCatSelect = document.getElementById('place-category-input');
    if (placeCatSelect) {
      placeCatSelect.innerHTML = cachedCategories.map(c => `
        <option value="${c.category_id}">${escapeHtml(c.category_name)}</option>
      `).join('');
    }
  }

  /**
   * Render Places Table (FR-7.1 - FR-7.4)
   */
  function renderPlacesTable(places) {
    if (!tbodyPlaces) return;

    if (places.length === 0) {
      tbodyPlaces.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-dim);">
            No tourist place records match your filters.
          </td>
        </tr>
      `;
      return;
    }

    tbodyPlaces.innerHTML = places.map(p => {
      const imgUrl = p.image_url || '/images/places/placeholder.svg';
      const dur = formatDurationSafe(p.estimated_duration_minutes || 60);

      return `
        <tr id="admin-place-row-${p.place_id}">
          <td>
            <img src="${escapeHtml(imgUrl)}" alt="" class="table-thumb">
          </td>
          <td>
            <strong style="font-size: 0.95rem; color: var(--text-heading);">${escapeHtml(p.place_name)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 2px;">
              📍 ${escapeHtml(p.location)}
            </div>
          </td>
          <td>
            <span class="badge-count">${escapeHtml(p.category_name)}</span>
          </td>
          <td>
            <span style="font-weight: 600; color: var(--text-heading);">${p.distance_km} km</span>
          </td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">
            ${escapeHtml(p.opening_time)} - ${escapeHtml(p.closing_time)}
          </td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">
            ~${dur}
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm btn-edit-place" data-id="${p.place_id}" title="Edit Place">
                Edit
              </button>
              <button class="btn btn-danger btn-sm btn-del-place" data-id="${p.place_id}" data-name="${escapeHtml(p.place_name)}" title="Delete Place">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach edit handlers
    tbodyPlaces.querySelectorAll('.btn-edit-place').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const place = cachedPlaces.find(p => p.place_id === id);
        if (place) openEditPlaceModal(place);
      });
    });

    // Attach delete handlers (FR-7.3)
    tbodyPlaces.querySelectorAll('.btn-del-place').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        openDeleteModal(`Are you sure you want to permanently delete the tourist place "${name}"? This action cannot be undone.`, async () => {
          try {
            await API.deletePlace(id);
            showToast(`Tourist place "${name}" was deleted successfully.`, 'success');
            await refreshDashboardData();
          } catch (err) {
            showToast(err.message || 'Failed to delete tourist place.', 'error');
          }
        });
      });
    });
  }

  function filterPlacesTable() {
    const search = adminPlacesSearch ? adminPlacesSearch.value.trim().toLowerCase() : '';
    const cat = adminCategoryFilter ? adminCategoryFilter.value : '';

    const filtered = cachedPlaces.filter(p => {
      const matchSearch = !search || p.place_name.toLowerCase().includes(search) || p.location.toLowerCase().includes(search);
      const matchCat = !cat || String(p.category_id) === String(cat);
      return matchSearch && matchCat;
    });

    renderPlacesTable(filtered);
  }

  /**
   * Render Categories Table (FR-8.1 - FR-8.3)
   */
  function renderCategoriesTable(categories) {
    if (!tbodyCategories) return;

    if (categories.length === 0) {
      tbodyCategories.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-dim);">
            No categories defined yet.
          </td>
        </tr>
      `;
      return;
    }

    tbodyCategories.innerHTML = categories.map(c => {
      const count = c.places_count !== undefined ? c.places_count : 0;
      const inUse = count > 0;

      return `
        <tr id="admin-cat-row-${c.category_id}">
          <td style="color: var(--text-dim); font-weight: 600;">#${c.category_id}</td>
          <td>
            <strong style="font-size: 0.95rem; color: var(--text-heading);">${escapeHtml(c.category_name)}</strong>
          </td>
          <td>
            <span class="badge-count" style="background-color: ${inUse ? 'var(--primary-light)' : 'var(--bg-subtle)'}; color: ${inUse ? 'var(--primary-text)' : 'var(--text-muted)'};">
              ${count} Place${count !== 1 ? 's' : ''} Assigned
            </span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm btn-edit-cat" data-id="${c.category_id}" data-name="${escapeHtml(c.category_name)}">
                Edit
              </button>
              <button class="btn btn-danger btn-sm btn-del-cat" data-id="${c.category_id}" data-name="${escapeHtml(c.category_name)}" data-count="${count}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach edit handlers
    tbodyCategories.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        openEditCatModal(id, name);
      });
    });

    // Attach delete handlers (FR-8.3)
    tbodyCategories.querySelectorAll('.btn-del-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        const count = parseInt(btn.dataset.count, 10);

        if (count > 0) {
          // FR-8.3 Protection
          alert(`Cannot delete category "${name}" because it is currently assigned to ${count} tourist attraction(s). Please reassign or delete those attractions first.`);
          return;
        }

        openDeleteModal(`Are you sure you want to delete the category "${name}"?`, async () => {
          try {
            await API.deleteCategory(id);
            showToast(`Category "${name}" deleted successfully.`, 'success');
            await refreshDashboardData();
          } catch (err) {
            showToast(err.message || 'Failed to delete category.', 'error');
          }
        });
      });
    });
  }

  /**
   * Place Modal Setup (FR-7.1, FR-7.2, FR-7.4)
   */
  function setupPlaceModalHandlers() {
    const openBtns = [document.getElementById('btn-top-add-place'), document.getElementById('btn-open-add-place')];
    openBtns.forEach(btn => {
      btn?.addEventListener('click', () => openAddPlaceModal());
    });

    document.getElementById('btn-close-place-modal')?.addEventListener('click', () => closePlaceModal());
    document.getElementById('btn-cancel-place')?.addEventListener('click', () => closePlaceModal());

    formManagePlace?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hidePlaceModalErrors();

      const placeId = document.getElementById('place-form-id').value;
      const isEdit = Boolean(placeId);

      const payload = {
        place_name: document.getElementById('place-name-input').value.trim(),
        category_id: parseInt(document.getElementById('place-category-input').value, 10),
        location: document.getElementById('place-location-input').value.trim(),
        distance_km: parseFloat(document.getElementById('place-distance-input').value),
        opening_time: document.getElementById('place-opening-input').value.trim() || '06:00 AM',
        closing_time: document.getElementById('place-closing-input').value.trim() || '06:00 PM',
        estimated_duration_minutes: parseInt(document.getElementById('place-duration-input').value, 10) || 60,
        latitude: document.getElementById('place-lat-input').value ? parseFloat(document.getElementById('place-lat-input').value) : null,
        longitude: document.getElementById('place-lng-input').value ? parseFloat(document.getElementById('place-lng-input').value) : null,
        image_url: document.getElementById('place-image-input').value.trim() || '/images/places/placeholder.svg',
        description: document.getElementById('place-description-input').value.trim(),
        travel_tips: document.getElementById('place-tips-input').value.trim(),
        visitor_guidelines: document.getElementById('place-guidelines-input').value.trim()
      };

      // Client-side validation (FR-7.4)
      if (!payload.place_name || !payload.location || !payload.description || isNaN(payload.distance_km)) {
        showPlaceModalErrors(['Please fill in all required fields marked with *.']);
        return;
      }

      if (payload.distance_km < 0 || payload.distance_km > 25.0) {
        showPlaceModalErrors(['Distance must be between 0.0 and 25.0 km from Sammanthurai.']);
        return;
      }

      const saveBtn = document.getElementById('btn-save-place');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        if (isEdit) {
          await API.updatePlace(placeId, payload);
          showToast(`Attraction "${payload.place_name}" updated.`, 'success');
        } else {
          await API.createPlace(payload);
          showToast(`Attraction "${payload.place_name}" added.`, 'success');
        }

        closePlaceModal();
        await refreshDashboardData();
      } catch (err) {
        const errorList = err.errors && err.errors.length > 0 ? err.errors : [err.message || 'Error saving record.'];
        showPlaceModalErrors(errorList);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Record';
      }
    });
  }

  function openAddPlaceModal() {
    modalPlaceTitle.textContent = 'Add New Tourist Place';
    document.getElementById('place-form-id').value = '';
    formManagePlace.reset();
    document.getElementById('place-duration-input').value = '60';
    document.getElementById('place-image-input').value = '/images/places/placeholder.svg';
    hidePlaceModalErrors();
    modalPlaceForm.classList.add('active');
  }

  function openEditPlaceModal(place) {
    modalPlaceTitle.textContent = `Edit Attraction: ${place.place_name}`;
    document.getElementById('place-form-id').value = place.place_id;
    document.getElementById('place-name-input').value = place.place_name;
    document.getElementById('place-category-input').value = place.category_id;
    document.getElementById('place-location-input').value = place.location;
    document.getElementById('place-distance-input').value = place.distance_km;
    document.getElementById('place-opening-input').value = place.opening_time || '';
    document.getElementById('place-closing-input').value = place.closing_time || '';
    document.getElementById('place-duration-input').value = place.estimated_duration_minutes || 60;
    document.getElementById('place-lat-input').value = place.latitude || '';
    document.getElementById('place-lng-input').value = place.longitude || '';
    document.getElementById('place-image-input').value = place.image_url || '';
    document.getElementById('place-description-input').value = place.description || '';
    document.getElementById('place-tips-input').value = place.travel_tips || '';
    document.getElementById('place-guidelines-input').value = place.visitor_guidelines || '';

    hidePlaceModalErrors();
    modalPlaceForm.classList.add('active');
  }

  function closePlaceModal() {
    modalPlaceForm.classList.remove('active');
  }

  function showPlaceModalErrors(errors) {
    placeModalErrors.innerHTML = errors.map(e => `<div>• ${escapeHtml(e)}</div>`).join('');
    placeModalErrors.style.display = 'block';
  }

  function hidePlaceModalErrors() {
    placeModalErrors.style.display = 'none';
  }

  /**
   * Category Modal Setup (FR-8.1, FR-8.2)
   */
  function setupCategoryModalHandlers() {
    document.getElementById('btn-open-add-cat')?.addEventListener('click', () => {
      modalCatTitle.textContent = 'Add New Attraction Category';
      document.getElementById('category-form-id').value = '';
      formManageCategory.reset();
      hideCatModalErrors();
      modalCategoryForm.classList.add('active');
    });

    document.getElementById('btn-close-cat-modal')?.addEventListener('click', () => closeCatModal());
    document.getElementById('btn-cancel-cat')?.addEventListener('click', () => closeCatModal());

    formManageCategory?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideCatModalErrors();

      const catId = document.getElementById('category-form-id').value;
      const isEdit = Boolean(catId);
      const name = document.getElementById('category-name-input').value.trim();

      if (!name) {
        showCatModalErrors(['Category name is required.']);
        return;
      }

      const saveBtn = document.getElementById('btn-save-cat');
      saveBtn.disabled = true;

      try {
        if (isEdit) {
          await API.updateCategory(catId, name);
          showToast(`Category updated to "${name}".`, 'success');
        } else {
          await API.createCategory(name);
          showToast(`Category "${name}" created.`, 'success');
        }

        closeCatModal();
        await refreshDashboardData();
      } catch (err) {
        showCatModalErrors([err.message || 'Failed to save category.']);
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  function openEditCatModal(id, name) {
    modalCatTitle.textContent = `Edit Category: ${name}`;
    document.getElementById('category-form-id').value = id;
    document.getElementById('category-name-input').value = name;
    hideCatModalErrors();
    modalCategoryForm.classList.add('active');
  }

  function closeCatModal() {
    modalCategoryForm.classList.remove('active');
  }

  function showCatModalErrors(errors) {
    catModalErrors.innerHTML = errors.map(e => `<div>• ${escapeHtml(e)}</div>`).join('');
    catModalErrors.style.display = 'block';
  }

  function hideCatModalErrors() {
    catModalErrors.style.display = 'none';
  }

  /**
   * Delete Confirmation Modal Setup
   */
  function setupDeleteModalHandlers() {
    document.getElementById('btn-close-del-modal')?.addEventListener('click', () => closeDeleteModal());
    document.getElementById('btn-cancel-delete')?.addEventListener('click', () => closeDeleteModal());

    btnConfirmDelete?.addEventListener('click', async () => {
      if (typeof deleteAction === 'function') {
        const action = deleteAction;
        closeDeleteModal();
        await action();
      }
    });
  }

  function openDeleteModal(promptMsg, onConfirm) {
    deletePromptText.textContent = promptMsg;
    deleteAction = onConfirm;
    modalDeleteConfirm.classList.add('active');
  }

  function closeDeleteModal() {
    modalDeleteConfirm.classList.remove('active');
    deleteAction = null;
  }
});
