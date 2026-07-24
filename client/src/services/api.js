import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Memory-only token store. Backed by sessionStorage so tab refresh keeps token
// without making it readable to any XSS payload that doesn't share the JS realm.
// NOTE: No browser-side storage is fully XSS-safe — keep server-side hardening
// (helmet, CSP, validation) as the primary defense.
let memToken = sessionStorage.getItem('jwt') || null;

let memUser = null;
try {
  const raw = sessionStorage.getItem('user');
  memUser = raw ? JSON.parse(raw) : null;
} catch { memUser = null; }

export const setAuth = (token, user) => {
  memToken = token || null;
  memUser = user || null;
  if (token) sessionStorage.setItem('jwt', token);
  else sessionStorage.removeItem('jwt');
  if (user) sessionStorage.setItem('user', JSON.stringify(user));
  else sessionStorage.removeItem('user');
};

export const clearAuth = () => setAuth(null, null);

export const getToken = () => memToken;
export const getUser = () => memUser;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (memToken) config.headers.Authorization = `Bearer ${memToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearAuth();
    if (process.env.NODE_ENV === 'development') {
      if (error.response) console.warn('API error:', error.response.status);
      else if (error.request) console.warn('Network error');
    }
    return Promise.reject(error);
  }
);

export const scanURL = async (url) => (await api.post('/scan', { url })).data;
export const getHistory = async (params = {}) => (await api.get('/history', { params })).data;
export const getStats = async () => (await api.get('/stats')).data;
export const deleteScan = async (id) => (await api.delete(`/history/${id}`)).data;
export const clearHistory = async () => (await api.delete('/history')).data;

export const login = async (credentials) => {
  const data = (await api.post('/auth/login', credentials)).data;
  if (data?.data?.token) setAuth(data.data.token, data.data.user);
  return data;
};

export const register = async (userData) => {
  const data = (await api.post('/auth/register', userData)).data;
  if (data?.data?.token) setAuth(data.data.token, data.data.user);
  return data;
};

export const getMe = async () => {
  if (!memToken) return { success: false, error: 'Not authenticated' };
  return (await api.get('/auth/me')).data;
};

export const scanQR = async (file) => {
  const form = new FormData();
  form.append('qrImage', file);
  return (await api.post('/qr/scan', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;
};

export const analyzeScreenshot = async (file) => {
  const form = new FormData();
  form.append('screenshot', file);
  return (await api.post('/screenshot/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data;
};

export const analyzeEmail = async (data) => (await api.post('/email/analyze', data)).data;
export const aiChat = async (message, conversationHistory = []) =>
  (await api.post('/ai-assistant/chat', { message, conversationHistory })).data;

export default api;
