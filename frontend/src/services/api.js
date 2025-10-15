import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Resources API calls
export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (resourceData) => api.post('/resources', resourceData),
  update: (id, resourceData) => api.put(`/resources/${id}`, resourceData),
  delete: (id) => api.delete(`/resources/${id}`),
  getSchedule: (id, startDate, endDate) => 
    api.get(`/resources/${id}/schedule`, {
      params: { startDate, endDate }
    }),
};

// Bookings API calls
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: (includePast = false) => 
    api.get('/bookings/my', { params: { includePast } }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/bookings/${id}`),
  getSlotBookings: (resourceId, date, slotNumber) => 
    api.get(`/bookings/slot/${resourceId}/${date}/${slotNumber}`),
  getStats: (params = {}) => api.get('/bookings/stats', { params }),
  checkAvailability: (resourceId, date, slotNumber) => 
    api.get(`/bookings/availability/${resourceId}/${date}/${slotNumber}`),
};

export default api;

