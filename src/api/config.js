/**
 * config.js — Axios instance với JWT interceptor
 * ─────────────────────────────────────────────────
 * .env: VITE_API_URL=http://localhost:8080/api
 *
 * baseURL = http://localhost:8080/api
 * Tất cả endpoint GỌI không có tiền tố /api nữa
 * VD: api.post('/auth/login')  → http://localhost:8080/api/auth/login  ✅
 *
 * BE trả thẳng data (không wrapper) — interceptor unwrap axios
 * Lỗi 401 → xóa token, redirect /login
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Đính kèm JWT vào mọi request ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Xử lý response ──
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status  = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error   ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message;

    if (status === 401) {
      localStorage.removeItem('mc_token');
      localStorage.removeItem('mc_auth');
      window.location.href = '/login';
    }

    return Promise.reject({ status, message, raw: error.response?.data });
  },
);

export default api;
