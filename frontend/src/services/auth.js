import api from './api';

const authService = {
  async login(email, password, rememberMe = false) {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/auth/account');
    this.logout();
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;