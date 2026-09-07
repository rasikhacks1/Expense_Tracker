import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const api = axios.create({
  baseURL: `${BASE_URL}/api/budgets`,
  headers: { 'Content-Type': 'application/json' },
});


export const getBudgets = () =>
  api.get('/').then((res) => res.data);


export const createBudget = (budget) =>
  api.post('/', budget).then((res) => res.data);


export const updateBudget = (id, budget) =>
  api.put(`/${id}`, budget).then((res) => res.data);


export const deleteBudget = (id) =>
  api.delete(`/${id}`);


export const getBudgetAlerts = (warn = true) =>
  api.get('/alerts', { params: { warn } }).then((res) => res.data);