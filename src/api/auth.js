/**
 * Auth API
 * DTO: LoginRequestDTO, RegisterRequestDTO
 */
import api from './config';

/**
 * Đăng nhập
 * @param {{ email: string, password: string }} data — LoginRequestDTO
 * @returns {{ token: string, user: object }}
 */
export const login = (data) =>
  api.post('/auth/login', {
    email:    data.email,
    password: data.password,
  });

/**
 * Đăng ký tài khoản bệnh nhân
 * @param {{ email, password, fullName, phone, cccd }} data — RegisterRequestDTO
 */
export const register = (data) =>
  api.post('/auth/register', {
    email:    data.email,
    password: data.password,
    fullName: data.fullName || data.name,   // FE dùng "name", BE dùng "fullName"
    phone:    data.phone,
    cccd:     data.cccd || '',
  });

/**
 * Lấy thông tin user hiện tại (dùng token)
 */
export const getMe = () => api.get('/auth/me');

/**
 * Đăng xuất (invalidate token phía server nếu BE hỗ trợ)
 */
export const logout = () => api.post('/auth/logout').catch(() => {}); // silent fail
