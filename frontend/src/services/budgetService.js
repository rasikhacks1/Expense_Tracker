

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: `${BASE}/api/budgets` });

export const budgetService = {
  getAll: (month) => api.get('/', { params: month ? { month } : {} }).then(r => r.data),
  getById: (id) => api.get(`/${id}`).then(r => r.data),
  getAlerts: (month) => api.get('/alerts', { params: month ? { month } : {} }).then(r => r.data),
  checkMonth: (month) => api.get('/check', { params: month ? { month } : {} }).then(r => r.data),
  create: (data) => api.post('/', data).then(r => r.data),
  update: (id, data) => api.put(`/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/${id}`).then(r => r.data),
};
