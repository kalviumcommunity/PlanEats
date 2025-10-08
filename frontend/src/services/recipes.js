import api from './api';

const recipeService = {
  // Get all recipes with filters
  async getRecipes(params = {}) {
    const {
      search,
      ingredients,
      dietaryTags,
      mealType,
      cuisine,
      difficulty,
      maxPrepTime,
      maxCookTime,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (ingredients) queryParams.append('ingredients', ingredients);
    if (dietaryTags) queryParams.append('dietaryTags', dietaryTags);
    if (mealType) queryParams.append('mealType', mealType);
    if (cuisine) queryParams.append('cuisine', cuisine);
    if (difficulty) queryParams.append('difficulty', difficulty);
    if (maxPrepTime) queryParams.append('maxPrepTime', maxPrepTime);
    if (maxCookTime) queryParams.append('maxCookTime', maxCookTime);
    queryParams.append('sortBy', sortBy);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await api.get(`/recipes?${queryParams.toString()}`);
    return response.data;
  },

  // Get single recipe
  async getRecipe(id) {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  // Create new recipe
  async createRecipe(recipeData) {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },

  // Update recipe
  async updateRecipe(id, recipeData) {
    const response = await api.put(`/recipes/${id}`, recipeData);
    return response.data;
  },

  // Delete recipe
  async deleteRecipe(id) {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  // Toggle favorite
  async toggleFavorite(id) {
    const response = await api.post(`/recipes/${id}/favorite`);
    return response.data;
  },

  // Add review
  async addReview(id, rating, comment) {
    const response = await api.post(`/recipes/${id}/reviews`, {
      rating,
      comment
    });
    return response.data;
  },

  // Get user's created recipes
  async getUserRecipes(params = {}) {
    const { page = 1, limit = 20, status = 'all' } = params;
    const response = await api.get(`/recipes/my/created?page=${page}&limit=${limit}&status=${status}`);
    return response.data;
  },

  // Get user's favorite recipes
  async getFavoriteRecipes(params = {}) {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/recipes/my/favorites?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get recipe categories
  async getCategories() {
    const response = await api.get('/recipes/meta/categories');
    return response.data;
  }
};

export default recipeService;