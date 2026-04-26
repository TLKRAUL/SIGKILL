import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor — pune token JWT dacă există
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sigkill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH =====
const clearAllData = () => {
  Object.keys(localStorage).filter(k => k.startsWith('sigkill_')).forEach(k => localStorage.removeItem(k));
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  if (response.data.token) {
    clearAllData(); // Clear old user's cached data
    localStorage.setItem('sigkill_token', response.data.token);
    localStorage.setItem('sigkill_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    clearAllData(); // Clear old user's cached data
    localStorage.setItem('sigkill_token', response.data.token);
    localStorage.setItem('sigkill_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('sigkill_user');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  // Clear all sigkill_ data from localStorage
  const keys = Object.keys(localStorage).filter(k => k.startsWith('sigkill_'));
  keys.forEach(k => localStorage.removeItem(k));
};

export const isLoggedIn = () => !!localStorage.getItem('sigkill_token');

// ===== TEST =====
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data.mesaj || response.data.message || 'Conectat';
  } catch { return null; }
};

// ===== RECEIPTS =====
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const response = await api.post('/receipts/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const getReceipts = async () => {
  const response = await api.get('/receipts');
  return response.data;
};

// ===== SCAN PRODUCT =====
export const scanProduct = async (file, expiryDate) => {
  const formData = new FormData();
  formData.append('receipt', file);
  if (expiryDate) formData.append('expiryDate', expiryDate);
  const response = await api.post('/receipts/scan-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

// ===== PANTRY =====
export const getPantryItems = async (params = {}) => {
  const response = await api.get('/pantry', { params });
  return response.data;
};

export const addItem = async (item) => {
  const response = await api.post('/pantry', item);
  return response.data;
};

export const updateItem = async (id, item) => {
  const response = await api.put(`/pantry/${id}`, item);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/pantry/${id}`);
  return response.data;
};

export const useRecipe = async (ingredients) => {
  const response = await api.post('/pantry/use-recipe', { ingredients });
  return response.data;
};

// ===== AI =====
export const askAI = async (message) => {
  const response = await api.post('/ai/ask', { message }, { timeout: 60000 });
  return response.data;
};

export const getRecipes = async () => {
  const response = await api.get('/ai/recipes', { timeout: 60000 });
  return response.data;
};

export const getMealPlan = async (params) => {
  const response = await api.post('/ai/meal-plan', params, { timeout: 120000 });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/pantry/stats/summary');
  return response.data;
};

// ===== BILLS =====
export const getBills = async () => {
  const response = await api.get('/bills');
  return response.data;
};

export const scanBill = async (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const response = await api.post('/bills/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const updateBill = async (id, data) => {
  const response = await api.put(`/bills/${id}`, data);
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await api.delete(`/bills/${id}`);
  return response.data;
};

export const findBetterSupplier = async (service, provider, amount) => {
  const response = await api.post('/bills/find-better', { service, provider, amount }, { timeout: 60000 });
  return response.data;
};

// ===== SUBSCRIPTION =====
export const getPlans = async () => {
  const response = await api.get('/subscription/plans');
  return response.data;
};

export const selectPlan = async (plan) => {
  const response = await api.post('/subscription/select', { plan });
  return response.data;
};

export const requestEnterprise = async (data) => {
  const response = await api.post('/subscription/enterprise-request', data);
  return response.data;
};

export const getSubscriptionStatus = async () => {
  const response = await api.get('/subscription/status');
  return response.data;
};

export default api;