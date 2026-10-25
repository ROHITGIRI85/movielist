import { http } from '../http/httpClient';

export const authApi = {
  register: (payload) => http.post('/auth/register', payload),
  login: (payload) => http.post('/auth/login', payload),
  refresh: () => http.post('/auth/refresh'),
  logout: () => http.post('/auth/logout'),
  profile: () => http.get('/auth/me'),
  updateProfile: (payload) => http.patch('/auth/me', payload),
};

export const catalogueApi = {
  movies: (params) => http.get('/movies', { params }),
  movie: (id) => http.get(`/movies/${id}`),
  cinemas: (params) => http.get('/cinemas', { params }),
  shows: (params) => http.get('/shows', { params }),
  show: (id) => http.get(`/shows/${id}`),
  seats: (id) => http.get(`/shows/${id}/seats`),
};

export const bookingApi = {
  hold: (payload) => http.post('/bookings/holds', payload),
  confirm: (id, payload) => http.post(`/bookings/${id}/confirm`, payload),
  list: (params) => http.get('/bookings', { params }),
  get: (id) => http.get(`/bookings/${id}`),
  cancel: (id) => http.post(`/bookings/${id}/cancel`),
};

export const adminApi = {
  movies: (params) => http.get('/admin/movies', { params }),
  movie: (id) => http.get(`/admin/movies/${id}`),
  createMovie: (payload) => http.post('/admin/movies', payload),
  updateMovie: (id, payload) => http.patch(`/admin/movies/${id}`, payload),
  archiveMovie: (id) => http.delete(`/admin/movies/${id}`),
  cinemas: (params) => http.get('/admin/cinemas', { params }),
  createCinema: (payload) => http.post('/admin/cinemas', payload),
  updateCinema: (id, payload) => http.patch(`/admin/cinemas/${id}`, payload),
  deactivateCinema: (id) => http.delete(`/admin/cinemas/${id}`),
  screens: (cinemaId) => http.get(`/admin/cinemas/${cinemaId}/screens`),
  createScreen: (cinemaId, payload) => http.post(`/admin/cinemas/${cinemaId}/screens`, payload),
  updateScreen: (id, payload) => http.patch(`/admin/screens/${id}`, payload),
  deactivateScreen: (id) => http.delete(`/admin/screens/${id}`),
  shows: (params) => http.get('/admin/shows', { params }),
  createShow: (payload) => http.post('/admin/shows', payload),
  updateShow: (id, payload) => http.patch(`/admin/shows/${id}`, payload),
  cancelShow: (id) => http.delete(`/admin/shows/${id}`),
  bookings: (params) => http.get('/admin/bookings', { params }),
};
