import api from './api';

const mealPlanService = {
  // Get user's meal plans
  async getMealPlans(params = {}) {
    const { status, page = 1, limit = 10, sort = 'created_at', order = 'desc' } = params;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sort', sort);
    queryParams.append('order', order);

    const response = await api.get(`/mealplans?${queryParams.toString()}`);
    return response.data;
  },

  // Get single meal plan
  async getMealPlan(id) {
    const response = await api.get(`/mealplans/${id}`);
    return response.data;
  },

  // Create meal plan manually
  async createMealPlan(mealPlanData) {
    const response = await api.post('/mealplans', mealPlanData);
    return response.data;
  },

  // Generate AI meal plan
  async generateMealPlan(params) {
    const response = await api.post('/mealplans/generate', params);
    return response.data;
  },

  // Update meal plan
  async updateMealPlan(id, mealPlanData) {
    const response = await api.put(`/mealplans/${id}`, mealPlanData);
    return response.data;
  },

  // Delete meal plan
  async deleteMealPlan(id) {
    const response = await api.delete(`/mealplans/${id}`);
    return response.data;
  },

  // Toggle favorite meal plan
  async toggleFavorite(id) {
    const response = await api.post(`/mealplans/${id}/favorite`);
    return response.data;
  },

  // Update specific meal in plan
  async updateMeal(planId, dayIndex, mealType, mealData) {
    const response = await api.post(`/mealplans/${planId}/meals/${dayIndex}/${mealType}`, mealData);
    return response.data;
  },

  // Mark meal as completed
  async completeMeal(planId, dayIndex, mealType, completed, rating = null) {
    const response = await api.put(`/mealplans/${planId}/meals/${dayIndex}/${mealType}/complete`, {
      completed,
      rating
    });
    return response.data;
  },

  // Get shopping list
  async getShoppingList(planId) {
    const response = await api.get(`/mealplans/${planId}/shopping-list`);
    return response.data;
  },

  // Update shopping list item
  async updateShoppingItem(planId, itemIndex, itemData) {
    const response = await api.put(`/mealplans/${planId}/shopping-list/${itemIndex}`, itemData);
    return response.data;
  },

  // Get meal plan analytics
  async getAnalytics(planId) {
    const response = await api.get(`/mealplans/${planId}/analytics`);
    return response.data;
  }
};

export default mealPlanService;