/**
 * Local Tourist Day-Visit Planner and Information System
 * Centralized API Client: public/js/api.js
 * Author: Ahmed ALL (E2410186)
 */

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Public Endpoints
  async getConfig() {
    return this.request('/config');
  },

  async getCategories() {
    return this.request('/categories');
  },

  async getPlaces(filters = {}) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.category) query.append('category', filters.category);
    if (filters.sortBy) query.append('sortBy', filters.sortBy);
    if (filters.sortOrder) query.append('sortOrder', filters.sortOrder);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/places${qs}`);
  },

  async getPlaceById(id) {
    return this.request(`/places/${id}`);
  },

  async getStats() {
    return this.request('/places/stats');
  },

  async savePlan(planData) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  },

  async getPlan(planId) {
    return this.request(`/plans/${planId}`);
  },

  // Authentication Endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Protected Admin Operations
  async createPlace(placeData) {
    return this.request('/places', {
      method: 'POST',
      body: JSON.stringify(placeData)
    });
  },

  async updatePlace(id, placeData) {
    return this.request(`/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placeData)
    });
  },

  async deletePlace(id) {
    return this.request(`/places/${id}`, {
      method: 'DELETE'
    });
  },

  async createCategory(categoryName) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ category_name: categoryName })
    });
  },

  async updateCategory(id, categoryName) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ category_name: categoryName })
    });
  },

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }
};
