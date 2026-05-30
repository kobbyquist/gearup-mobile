// ─────────────────────────────────────────
// GEARUP — Axios API Instance
// ─────────────────────────────────────────
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ───────────────────
// Automatically attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('gearup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──────────────────
// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      await SecureStore.deleteItemAsync('gearup_token');
      await SecureStore.deleteItemAsync('gearup_user');
      // Navigation to login handled by auth state listener
    }
    return Promise.reject(error);
  }
);

export default api;