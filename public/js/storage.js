
const STORAGE_KEY = 'sammanthurai_tourist_plan_v1';

const PlanStorage = {
  getPlan() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read plan from localStorage:', e);
      return [];
    }
  },

  savePlan(plan) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      this.updateBadgeCount();
      window.dispatchEvent(new CustomEvent('planUpdated', { detail: plan }));
      return true;
    } catch (e) {
      console.error('Failed to save plan to localStorage:', e);
      return false;
    }
  },

  addPlace(place) {
    const plan = this.getPlan();
    const exists = plan.some(item => item.place_id === place.place_id);

    if (exists) {
      return { success: false, message: `"${place.place_name}" is already in your visit plan.` };
    }

    // Add to end of plan
    plan.push({
      place_id: place.place_id,
      place_name: place.place_name,
      category_name: place.category_name,
      distance_km: place.distance_km,
      location: place.location,
      opening_time: place.opening_time,
      closing_time: place.closing_time,
      estimated_duration_minutes: parseInt(place.estimated_duration_minutes, 10) || 60,
      image_url: place.image_url,
      travel_tips: place.travel_tips,
      visitor_guidelines: place.visitor_guidelines,
      latitude: place.latitude,
      longitude: place.longitude
    });

    this.savePlan(plan);
    return { success: true, message: `Added "${place.place_name}" to your visit plan.` };
  },

  removePlace(placeId) {
    const plan = this.getPlan();
    const id = parseInt(placeId, 10);
    const filtered = plan.filter(item => item.place_id !== id);
    this.savePlan(filtered);
    return { success: true, message: 'Attraction removed from your visit plan.' };
  },

  moveUp(index) {
    const plan = this.getPlan();
    if (index <= 0 || index >= plan.length) return false;

    // Swap index with index - 1
    const temp = plan[index];
    plan[index] = plan[index - 1];
    plan[index - 1] = temp;

    this.savePlan(plan);
    return true;
  },

  moveDown(index) {
    const plan = this.getPlan();
    if (index < 0 || index >= plan.length - 1) return false;

    // Swap index with index + 1
    const temp = plan[index];
    plan[index] = plan[index + 1];
    plan[index + 1] = temp;

    this.savePlan(plan);
    return true;
  },

  clearPlan() {
    this.savePlan([]);
    return { success: true, message: 'Visit plan cleared.' };
  },

  isInPlan(placeId) {
    const plan = this.getPlan();
    const id = parseInt(placeId, 10);
    return plan.some(item => item.place_id === id);
  },

  getTotalDuration() {
    const plan = this.getPlan();
    return plan.reduce((sum, item) => sum + (parseInt(item.estimated_duration_minutes, 10) || 60), 0);
  },

  formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} mins`;
    if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr ${minutes} mins`;
  },

  updateBadgeCount() {
    const count = this.getPlan().length;
    const badges = document.querySelectorAll('.planner-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }
};

// Initial badge update when script executes
document.addEventListener('DOMContentLoaded', () => {
  PlanStorage.updateBadgeCount();
});
