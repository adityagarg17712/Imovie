import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    return await api.post('/bookings', bookingData);
  },

  async getUserBookings(params = {}) {
    return await api.get('/bookings/my-bookings', { params });
  },

  async getBookingById(id) {
    return await api.get(`/bookings/${id}`);
  },

  async cancelBooking(id, reason) {
    return await api.put(`/bookings/${id}/cancel`, { reason });
  },

  async processPayment(paymentData) {
    return await api.post('/payments/process', paymentData);
  },
};
