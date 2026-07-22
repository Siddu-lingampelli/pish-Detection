import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const scanURL = async (url) => {
  const response = await api.post('/scan', { url });
  return response.data;
};

export const getHistory = async (params = {}) => {
  const response = await api.get('/history', { params });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const deleteScan = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/history');
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const scanQR = async (file) => {
  const form = new FormData();
  form.append('qrImage', file);
  const response = await api.post('/qr/scan', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeScreenshot = async (file) => {
  const form = new FormData();
  form.append('screenshot', file);
  const response = await api.post('/screenshot/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeEmail = async (data) => {
  const response = await api.post('/email/analyze', data);
  return response.data;
};

export const aiChat = async (message, conversationHistory = []) => {
  const response = await api.post('/ai-assistant/chat', { message, conversationHistory });
  return response.data;
};

export default api;
