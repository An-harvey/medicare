/**
 * AuthContext — Quản lý xác thực toàn ứng dụng
 * ───────────────────────────────────────────────
 * Login  : POST /api/auth/login  → { token, email, role }
 *          Lưu token vào localStorage
 *          Redirect theo role (lo_trinh.txt mục 8.1)
 *
 * Register: POST /api/auth/register → plain string (201)
 *           KHÔNG auto-login → redirect /login với successMsg
 *
 * Role BE : PATIENT | DOCTOR | ADMIN | STAFF
 * Role FE : user    | doctor | admin | staff  (lowercase, dùng cho UI)
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authLogin, authRegister } from '../api/auth';
import { BE_TO_FE_ROLE, ROLE_LABEL, ROLE_HOME_ROUTE } from '../utils/constants';

const AuthContext = createContext(null);

/* ── Tạo user object FE từ response BE ── */
function buildUser(email, beRole, token) {
  const feRole = BE_TO_FE_ROLE[beRole] || 'user';
  return {
    email,
    username: email,
    beRole,               // "PATIENT" | "DOCTOR" | "ADMIN" | "STAFF"
    role:     feRole,     // "user" | "doctor" | "admin" | "staff"
    label:    ROLE_LABEL[beRole] || 'Người dùng',
    name:     email.split('@')[0], // BE không trả name trong login → dùng tạm
    token,
    avatarUrl: null,
  };
}

function saveSession(user) {
  localStorage.setItem('mc_auth',  JSON.stringify(user));
  localStorage.setItem('mc_token', user.token);
}
function clearSession() {
  localStorage.removeItem('mc_auth');
  localStorage.removeItem('mc_token');
}
function loadUser() {
  try { return JSON.parse(localStorage.getItem('mc_auth')); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(loadUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) saveSession(user);
    else clearSession();
  }, [user]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('mc:auth-expired', onExpired);
    return () => window.removeEventListener('mc:auth-expired', onExpired);
  }, []);

  /* ─────────── ĐĂNG NHẬP ─────────── */
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      // POST /api/auth/login → { token, email, role }
      const res = await authLogin({ email, password });
      const userData = buildUser(res.email, res.role, res.token);
      setUser(userData);
      setLoading(false);
      return { ok: true, role: res.role };
    } catch (err) {
      setLoading(false);
      const msg = err?.message || err?.raw?.message || 'Email hoặc mật khẩu không đúng.';
      return { ok: false, error: msg };
    }
  };

  /* ─────────── ĐĂNG KÝ (PATIENT) ─────────── */
  const register = async ({ name, email, phone, password, cccd }) => {
    setLoading(true);
    try {
      // POST /api/auth/register → "Đăng ký thành công" (201)
      await authRegister({ fullName: name, email, phone, password, cccd: cccd || '' });
      setLoading(false);
      return { ok: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
    } catch (err) {
      setLoading(false);
      const msg = err?.message || err?.raw?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      return { ok: false, error: msg };
    }
  };

  /* ─────────── ĐĂNG XUẤT ─────────── */
  const logout = () => setUser(null);

  /* Cập nhật thông tin user local sau khi sửa profile */
  const updateLocalUser = (patch) =>
    setUser(prev => prev ? { ...prev, ...patch } : prev);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), loading, login, logout, register, updateLocalUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}

export { ROLE_HOME_ROUTE as ROLE_HOME };
