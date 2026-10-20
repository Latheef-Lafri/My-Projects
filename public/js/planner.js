/**
 * Local Tourist Day-Visit Planner and Information System
 * One-Day Visit Planner Controller: public/js/planner.js
 * Implements FR-5.1, FR-5.2, FR-5.3, FR-5.4
 * Author: Ahmed ALL (E2410186)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const stopsContainer = document.getElementById('itinerary-stops-container');
  const stopCounter = document.getElementById('stop-counter');
  const durationDisplay = document.getElementById('total-duration-display');
  const timelineBreakdown = document.getElementById('timeline-breakdown');
  const btnClearPlan = document.getElementById('btn-clear-plan-action');
  const printDateEl = document.getElementById('print-date');
  const quickAddModal = document.getElementById('quick-add-modal');
  const modalPlacesList = document.getElementById('modal-places-list');
  const shareLinkFeedback = document.getElementById('share-link-feedback');

  if (printDateEl) {
    const now = new Date();
    printDateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Handle plan loading from URL param e.g. ?share_id=...
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('plan_id');
  if (shareId) {
    try {
      const planRes = await API.getPlan(shareId);
      if (planRes.success && planRes.data?.items) {
        PlanStorage.savePlan(planRes.data.items);
        showToast('Shared itinerary loaded successfully!', 'success');
      }
    } catch (e) {
      console.warn('Could not load shared plan ID:', e);
    }
  }

  // Initial render
  renderItinerary();

  // Print buttons handler (FR-5.4 Print-Friendly Itinerary)
  document.querySelectorAll('.btn-print').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = PlanStorage.getPlan();
      if (plan.length === 0) {
        showToast('Please add at least one attraction to your plan before printing.', 'info');
        return;
      }
      window.print();
    });
  });

  // Clear plan action (FR-5.3)
  if (btnClearPlan) {
    btnClearPlan.addEventListener('click', () => {
      const plan = PlanStorage.getPlan();
      if (plan.length === 0) {
        showToast('Your visit plan is already empty.', 'info');
        return;
      }
      if (confirm('Are you sure you want to clear your current visit plan?')) {
        PlanStorage.clearPlan();
        renderItinerary();
        showToast('Visit plan cleared.', 'info');
      }
    });
  }

  // Save / Share plan action
  const btnShare = document.getElementById('btn-share-plan');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const plan = PlanStorage.getPlan();
      if (plan.length === 0) {
        showToast('Add attractions to your plan before saving or sharing.', 'info');
        return;
      }

      btnShare.disabled = true;
      btnShare.textContent = 'Saving Plan...';

      try {
        const placeIds = plan.map(item => item.place_id);
        const planName = 'Sammanthurai Day-Visit (' + plan.length + ' stops)';
        const res = await API.savePlan({ plan_name: planName, place_ids: placeIds });

        if (res.success && res.data) {
          const shareUrl = `${window.location.origin}/planner.html?plan_id=${res.data.plan_id}`;
          if (shareLinkFeedback) {
            shareLinkFeedback.innerHTML = `
              <div class="info-box" style="margin-top: 10px; padding: 12px;">
                <div class="info-box-title">Shareable Link Ready:</div>
                <input type="text" readonly value="${shareUrl}" class="form-input" style="padding: 6px 10px; font-size: 0.82rem; margin-top: 4px;" onclick="this.select();">
                <button class="btn btn-primary btn-sm" style="margin-top: 6px; width: 100%;" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => showToast('Copied to clipboard!', 'success'))">
                  Copy Link to Clipboard
                </button>
              </div>
            `;
          }
          showToast('Itinerary saved to database!', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to save itinerary on server.', 'error');
      } finally {
        btnShare.disabled = false;
        btnShare.textContent = '🔗 Save & Generate Share Link';
      }
    });
  }

  // Quick Add Modal Triggers
  const openModalBtns = [document.getElementById('btn-quick-add-place'), document.getElementById('btn-browse-modal-trigger')];
  openModalBtns.forEach(btn => {
    btn?.addEventListener('click', () => openQuickAddModal());
  });

  document.getElementById('btn-close-modal')?.addEventListener('click', () => closeQuickAddModal());
  document.getElementById('btn-modal-done')?.addEventListener('click', () => closeQuickAddModal());

  // Listen to plan updates across window
  window.addEventListener('planUpdated', () => {
    renderItinerary();
  });

  /**
   * Main Render Function for Itinerary Stops and Summary (FR-5.2, FR-5.3, FR-5.4)
   */
  function renderItinerary() {
    const plan = PlanStorage.getPlan();

    // 1. Update stop counter
    if (stopCounter) stopCounter.textContent = plan.length;

    // 2. Empty state check
    if (plan.length === 0) {
      if (stopsContainer) {
        stopsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3 class="empty-state-title">Your Visit Plan is Empty</h3>
            <p class="empty-state-desc">
              You haven't added any attractions to your one-day visit itinerary yet.
              Browse our curated list of attractions within 25 km of Sammanthurai and click "+ Add to Plan".
            </p>
            <button class="btn btn-primary btn-sm" id="btn-empty-add-trigger">
              + Choose Attractions
            </button>
          </div>
        `;
        document.getElementById('btn-empty-add-trigger')?.addEventListener('click', () => openQuickAddModal());
      }

      if (durationDisplay) durationDisplay.textContent = '0 hr 0 mins';
      if (timelineBreakdown) {
        timelineBreakdown.innerHTML = '<p style="color: var(--text-dim);">No attractions added yet. Add stops to see a timeline schedule.</p>';
      }
      return;
    }

    // 3. Render Cards with Move Up / Move Down and Remove controls (FR-5.2, FR-5.3)
    if (stopsContainer) {
      stopsContainer.innerHTML = plan.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === plan.length - 1;
        const imgUrl = item.image_url || '/images/places/placeholder.svg';
        const durFormatted = PlanStorage.formatDuration(item.estimated_duration_minutes || 60);

        return `
          <div class="itinerary-card" id="itinerary-stop-${item.place_id}">
            <!-- Stop Number Badge -->
            <div class="stop-badge">${index + 1}</div>

            <!-- Thumbnail -->
            <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.place_name)}" class="itinerary-thumb">

            <!-- Information -->
            <div class="itinerary-info">
              <a href="/place-details.html?id=${item.place_id}" class="itinerary-name">
                ${escapeHtml(item.place_name)}
              </a>
              <div class="itinerary-sub">
                <span>📍 ~${item.distance_km} km</span>
                <span>🏷️ ${escapeHtml(item.category_name || 'General')}</span>
                <span>⏱️ ~${durFormatted}</span>
              </div>
              <div class="print-notes">
                <strong>Tips:</strong> ${escapeHtml(item.travel_tips || 'Respect local guidelines.')}
              </div>
            </div>

            <!-- Reorder Controls (FR-5.2) -->
            <div class="itinerary-controls">
              <button class="order-btn btn-move-up" data-index="${index}" ${isFirst ? 'disabled' : ''} title="Move Up" aria-label="Move Up">
                ▲
              </button>
              <button class="order-btn btn-move-down" data-index="${index}" ${isLast ? 'disabled' : ''} title="Move Down" aria-label="Move Down">
                ▼
              </button>
            </div>

            <!-- Remove Button (FR-5.3) -->
            <button class="remove-stop-btn" data-id="${item.place_id}" title="Remove Stop" aria-label="Remove Stop">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `;
      }).join('');

      // Attach Move Up handlers (FR-5.2)
      stopsContainer.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          PlanStorage.moveUp(idx);
          renderItinerary();
        });
      });

      // Attach Move Down handlers (FR-5.2)
      stopsContainer.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          PlanStorage.moveDown(idx);
          renderItinerary();
        });
      });

      // Attach Remove handlers (FR-5.3)
      stopsContainer.querySelectorAll('.remove-stop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id, 10);
          PlanStorage.removePlace(id);
          renderItinerary();
          showToast('Attraction removed from plan.', 'info');
        });
      });
    }

    // 4. Calculate total visit duration (FR-5.4)
    const totalMinutes = PlanStorage.getTotalDuration();
    if (durationDisplay) {
      durationDisplay.textContent = PlanStorage.formatDuration(totalMinutes);
    }

    // 5. Render Suggested Schedule Timeline starting at 08:30 AM
    if (timelineBreakdown) {
      let currentMinutes = 8 * 60 + 30; // 08:30 AM in minutes from midnight
      let timelineHtml = '';

      plan.forEach((item, idx) => {
        const startStr = formatTimeFromMinutes(currentMinutes);
        const stayDuration = parseInt(item.estimated_duration_minutes, 10) || 60;
        const endMinutes = currentMinutes + stayDuration;
        const endStr = formatTimeFromMinutes(endMinutes);

        timelineHtml += `
          <div style="padding: 10px 14px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm); border-left: 3px solid var(--primary);">
            <div style="font-weight: 700; color: #fff; font-size: 0.92rem;">
              Stop ${idx + 1}: ${escapeHtml(item.place_name)}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
              <span>🕒 ${startStr} - ${endStr} (${PlanStorage.formatDuration(stayDuration)})</span>
              <span>📍 ~${item.distance_km} km</span>
            </div>
          </div>
        `;

        // Add 20 minutes travel/buffer between stops
        currentMinutes = endMinutes + 20;
      });

      timelineBreakdown.innerHTML = timelineHtml;
    }
  }

  function formatTimeFromMinutes(totalMins) {
    const hours24 = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minsPadded = mins < 10 ? '0' + mins : mins;
    return `${hours12}:${minsPadded} ${period}`;
  }

  // Quick Add Modal Logic
  async function openQuickAddModal() {
    if (!quickAddModal) return;
    quickAddModal.classList.add('active');

    if (modalPlacesList) {
      modalPlacesList.innerHTML = '<p style="color: var(--text-muted);">Loading available places...</p>';
      try {
        const res = await API.getPlaces();
        const places = res.data || [];
        modalPlacesList.innerHTML = places.map(p => {
          const inPlan = PlanStorage.isInPlan(p.place_id);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background-color: var(--bg-alt); border: 1px solid var(--border-color); border-radius: var(--radius-sm); gap: 12px;">
              <div>
                <strong style="color: var(--text-heading); font-size: 0.95rem;">${escapeHtml(p.place_name)}</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  ${escapeHtml(p.category_name)} • ~${p.distance_km} km • ~${PlanStorage.formatDuration(p.estimated_duration_minutes || 60)}
                </div>
              </div>
              <button class="btn ${inPlan ? 'btn-outline-primary' : 'btn-primary'} btn-sm btn-modal-add" 
                      data-id="${p.place_id}" ${inPlan ? 'disabled' : ''}>
                ${inPlan ? '✓ In Plan' : '+ Add'}
              </button>
            </div>
          `;
        }).join('');

        modalPlacesList.querySelectorAll('.btn-modal-add').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const targetPlace = places.find(p => p.place_id === id);
            if (targetPlace) {
              const res = PlanStorage.addPlace(targetPlace);
              if (res.success) {
                showToast(res.message, 'success');
                btn.disabled = true;
                btn.textContent = '✓ In Plan';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
                renderItinerary();
              }
            }
          });
        });
      } catch (e) {
        modalPlacesList.innerHTML = '<p style="color: var(--danger);">Failed to load attractions list.</p>';
      }
    }
  }

  function closeQuickAddModal() {
    if (quickAddModal) quickAddModal.classList.remove('active');
  }
});
