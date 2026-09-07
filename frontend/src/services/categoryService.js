import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const api = axios.create({
  baseURL: `${BASE_URL}/api/categories`,
  headers: { 'Content-Type': 'application/json' },
});


export const getCategories = (type) =>
  api.get('/', { params: type ? { type } : {} }).then((res) => res.data);


export const createCategory = (category) =>
  api.post('/', category).then((res) => res.data);


export const updateCategory = (id, category) =>
  api.put(`/${id}`, category).then((res) => res.data);

export const deleteCategory = (id) =>
  api.delete(`/${id}`);