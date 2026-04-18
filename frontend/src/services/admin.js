import api from './api';

const adminService = {
  // Dashboard stats
  async getDashboardStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Analytics
  async getAnalytics(params = {}) {
    const { period = '30' } = params;
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // User management
  async getAllUsers(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      order
    });

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id, updateData) {
    const response = await api.put(`/admin/users/${id}`, updateData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Recipe moderation
  async getPendingRecipes(params = {}) {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/admin/recipes/pending?page=${page}&limit=${limit}`);
    return response.data;
  },

  async verifyRecipe(id, isVerified, rejectionReason = '') {
    const response = await api.put(`/admin/recipes/${id}/verify`, {
      isVerified,
      rejectionReason
    });
    return response.data;
  },

  async getAllRecipes(params = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      cuisine = '',
      difficulty = '',
      isVerified = ''
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      search,
      cuisine,
      difficulty,
      isVerified
    });

    const response = await api.get(`/admin/recipes?${queryParams.toString()}`);
    return response.data;
  },

  async updateRecipe(id, recipeData) {
    const response = await api.put(`/admin/recipes/${id}`, recipeData);
    return response.data;
  },

  async deleteRecipe(id) {
    const response = await api.delete(`/admin/recipes/${id}`);
    return response.data;
  }
};

export default adminService;
