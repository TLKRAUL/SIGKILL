import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test connection
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data.mesaj || response.data.message || 'Conectat';
  } catch {
    return null;
  }
};

// Upload receipt image
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  const response = await api.post('/receipts/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s — Gemini Vision needs time
  });
  return response.data;
};

// Get all pantry items
export const getPantryItems = async (params = {}) => {
  const response = await api.get('/pantry', { params });
  return response.data;
};

// Add item to pantry
export const addItem = async (item) => {
  const response = await api.post('/pantry', item);
  return response.data;
};

// Update item in pantry
export const updateItem = async (id, item) => {
  const response = await api.put(`/pantry/${id}`, item);
  return response.data;
};

// Delete item from pantry
export const deleteItem = async (id) => {
  const response = await api.delete(`/pantry/${id}`);
  return response.data;
};

// Ask AI assistant
export const askAI = async (message) => {
  const response = await api.post('/ai/ask', { message }, {
    timeout: 60000, // 60s — Gemini needs time to think
  });
  return response.data;
};

// Get recipe suggestions
export const getRecipes = async () => {
  const response = await api.get('/ai/recipes', {
    timeout: 60000,
  });
  return response.data;
};

// Get pantry stats
export const getStats = async () => {
  const response = await api.get('/pantry/stats/summary');
  return response.data;
};

export default api;