/**
 * services/expenseService.js
 * Axios calls for the Expenses API.
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: `${BASE}/api/expenses` });

export const expenseService = {
  getAll: (params = {}) => api.get('/', { params }).then(r => r.data),
  getById: (id) => api.get(`/${id}`).then(r => r.data),
  getSummary: (month) => api.get('/summary', { params: { month } }).then(r => r.data),
  create: (data) => api.post('/', data).then(r => r.data),
  update: (id, data) => api.put(`/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/${id}`).then(r => r.data),
};
