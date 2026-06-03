/**
 * authApi — Không cần token
 * ─────────────────────────────────────────────────────────────
 * baseURL đã là http://localhost:8080/api (từ .env)
 * → endpoint chỉ cần: /auth/login, /auth/register
 *
 * POST /auth/login    Body: { email, password }
 *                     Response: { token, email, role }
 *
 * POST /auth/register Body: { email, password, fullName, phone, cccd }
 *                     Response: plain string "Đăng ký thành công" (201)
 */
import api from './config';

export const authLogin = (data) =>
  api.post('/auth/login', {
    email:    data.email,
    password: data.password,
  });

export const authRegister = (data) =>
  api.post('/auth/register', {
    email:    data.email,
    password: data.password,
    fullName: data.fullName || data.name,
    phone:    data.phone,
    cccd:     data.cccd || '',
  });
