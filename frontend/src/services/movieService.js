import api from './api';

export const movieService = {
  async getMovies(params = {}) {
    return await api.get('/movies', { params });
  },

  async getMovieById(id) {
    return await api.get(`/movies/${id}`);
  },

  async getFilterOptions() {
    return await api.get('/movies/filters/options');
  },

  async createMovie(data) {
    return await api.post('/movies', data);
  },

  async updateMovie(id, data) {
    return await api.put(`/movies/${id}`, data);
  },

  async deleteMovie(id) {
    return await api.delete(`/movies/${id}`);
  },

  // Shows API
  async getShows(params = {}) {
    return await api.get('/shows', { params });
  },

  async getShowDetailsAndSeats(showId) {
    return await api.get(`/shows/${showId}`);
  },

  async createShow(showData) {
    return await api.post('/shows', showData);
  },

  async cancelShow(showId) {
    return await api.put(`/shows/${showId}/cancel`);
  },

  // Theatres API
  async getTheatres(params = {}) {
    return await api.get('/theatres', { params });
  },

  async createTheatre(data) {
    return await api.post('/theatres', data);
  },

  // Admin stats
  async getAdminStats() {
    return await api.get('/admin/dashboard');
  },

  async getAllBookings(params = {}) {
    return await api.get('/admin/bookings', { params });
  },
};
