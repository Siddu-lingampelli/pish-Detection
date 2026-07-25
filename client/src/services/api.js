import axios from 'axios';
import { setAuth, clearAuth, getToken, getUser } from './localAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Attach JWT token to every request when available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      if (error.response) console.warn('API error:', error.response.status);
      else if (error.request) console.warn('Network error');
    }
    // If 401, clear expired session
    if (error.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = setAuth;
export const clearAuthToken = clearAuth;
export { getToken, getUser, clearAuth };

// ── Scan ──

export const scanURL = async (url) => {
  const res = (await api.post('/scan', { url })).data;
  if (res?.success && res.data) {
    // Also save locally for offline fallback
    const { saveScan } = await import('./localAuth');
    saveScan(res.data);
  }
  return res;
};

// ── Auth (server-backed, falls back to local storage) ──

export const login = async (creds) => {
  // Try server first
  try {
    const res = await api.post('/auth/login', creds);
    const d = res.data;
    if (d?.success && d.token) {
      setAuth(d.token, d.user);
      return { success: true, data: { token: d.token, user: d.user } };
    }
  } catch (serverErr) {
    // Server unavailable — try local fallback
    if (!serverErr.response || serverErr.code === 'ERR_NETWORK') {
      const { loginLocal } = await import('./localAuth');
      const data = await loginLocal(creds);
      return { success: true, data: { token: data.token, user: data.user } };
    }
    throw serverErr;
  }
};

export const register = async (userData) => {
  // Try server first
  try {
    const res = await api.post('/auth/register', userData);
    const d = res.data;
    if (d?.success && d.token) {
      setAuth(d.token, d.user);
      return { success: true, data: { token: d.token, user: d.user } };
    }
  } catch (serverErr) {
    // Server unavailable — try local fallback
    if (!serverErr.response || serverErr.code === 'ERR_NETWORK') {
      const { registerLocal } = await import('./localAuth');
      const data = await registerLocal(userData);
      return { success: true, data: { token: data.token, user: data.user } };
    }
    throw serverErr;
  }
};

export const getMe = async () => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    if (!err.response) {
      const u = getUser();
      if (!u) return { success: false, error: 'Not authenticated' };
      return { success: true, user: u };
    }
    throw err;
  }
};

// ── History & Stats (server-backed, falls back to local) ──

export const getHistory = async (params = {}) => {
  try {
    const res = await api.get('/history', { params });
    return res.data;
  } catch (err) {
    if (!err.response) {
      const { getLocalHistory } = await import('./localAuth');
      const r = getLocalHistory(params);
      return { success: true, data: r };
    }
    throw err;
  }
};

export const getStats = async () => {
  try {
    const res = await api.get('/stats');
    return res.data;
  } catch (err) {
    if (!err.response) {
      const { getLocalStats } = await import('./localAuth');
      const s = getLocalStats();
      return { success: true, data: s };
    }
    throw err;
  }
};

export const deleteScan = async (id) => {
  try {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  } catch (err) {
    if (!err.response) {
      const { deleteLocalScan } = await import('./localAuth');
      const removed = deleteLocalScan(id);
      if (!removed) return { success: false, message: 'Not found' };
      return { success: true, message: 'Deleted', data: removed };
    }
    throw err;
  }
};

export const clearHistory = async () => {
  try {
    const res = await api.delete('/history');
    return res.data;
  } catch (err) {
    if (!err.response) {
      const { clearLocalHistory } = await import('./localAuth');
      const count = clearLocalHistory();
      return { success: true, message: 'Cleared', data: { deletedCount: count } };
    }
    throw err;
  }
};

// ── QR, Screenshot, Email, AI ──

export const scanQR = async (file) => {
  const form = new FormData();
  form.append('qrImage', file);
  return (await api.post('/qr/scan', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};

export const analyzeScreenshot = async (file) => {
  const form = new FormData();
  form.append('screenshot', file);
  return (await api.post('/screenshot/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};

export const analyzeEmail = async (data) => (await api.post('/email/analyze', data)).data;
export const aiChat = async (message, conversationHistory = []) =>
  (await api.post('/ai-assistant/chat', { message, conversationHistory })).data;

export default api;
