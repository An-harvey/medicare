/**
 * Cấu hình Axios base — đọc BASE_URL từ .env
 * VITE_API_URL=http://localhost:8080/api
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: đính kèm JWT ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response interceptor: xử lý lỗi chung ── */
api.interceptors.response.use(
  (response) => response.data,          // trả thẳng data, bỏ wrapper axios
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Token hết hạn → xóa storage, reload về login
      localStorage.removeItem('mc_token');
      localStorage.removeItem('mc_auth');
      window.location.href = '/login';
    }

    return Promise.reject({ status, message, raw: error.response?.data });
  },
);

export default api;
