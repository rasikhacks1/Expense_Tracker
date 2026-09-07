import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const api = axios.create({
  baseURL: `${BASE_URL}/api/expenses`,
  headers: { 'Content-Type': 'application/json' },
});


export const getExpenses = () =>
  api.get('/').then((res) => res.data);


export const getExpenseById = (id) =>
  api.get(`/${id}`).then((res) => res.data);


export const createExpense = (expense) =>
  api.post('/', expense).then((res) => res.data);

export const updateExpense = (id, expense) =>
  api.put(`/${id}`, expense).then((res) => res.data);

export const deleteExpense = (id) =>
  api.delete(`/${id}`);

export const checkBudget = (payload) =>
  api.post('/check-budget', payload).then((res) => res.data);
