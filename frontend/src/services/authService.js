import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('imovies_token', res.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.user));
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.token) {
      localStorage.setItem('imovies_token', res.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  },

  logout() {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('imovies_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('imovies_token');
  },
};
