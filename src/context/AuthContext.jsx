import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

/* ── Redirect mặc định theo role ── */
export const ROLE_HOME = {
  PATIENT: '/dashboard',
  DOCTOR:  '/dashboard',
  ADMIN:   '/dashboard',
  STAFF:   '/dashboard',
  // fallback cho mock (lowercase)
  user:    '/dashboard',
  doctor:  '/dashboard',
  admin:   '/dashboard',
  staff:   '/dashboard',
};

/* ── Mock accounts — dùng khi chưa có BE ── */
const MOCK_ACCOUNTS = [
  { id:'u1', username:'user',   email:'user@medcare.vn',   password:'user123',   name:'Nguyễn Văn A',      role:'user',   label:'Người dùng',        token:'mock-token-user' },
  { id:'d1', username:'doctor', email:'doctor@medcare.vn', password:'doctor123', name:'BS. Trần Thị Bình', role:'doctor', label:'Bác sĩ',             token:'mock-token-doctor' },
  { id:'a1', username:'admin',  email:'admin@medcare.vn',  password:'admin123',  name:'Admin MedCare',     role:'admin',  label:'Quản trị viên',      token:'mock-token-admin' },
  { id:'s1', username:'staff',  email:'staff@medcare.vn',  password:'staff123',  name:'Lê Thị Hoa',        role:'staff',  label:'Lễ tân / Nhân viên', token:'mock-token-staff' },
];

/* ── Helpers ── */
function saveSession(user, token) {
  localStorage.setItem('mc_auth',  JSON.stringify(user));
  localStorage.setItem('mc_token', token);
}
function clearSession() {
  localStorage.removeItem('mc_auth');
  localStorage.removeItem('mc_token');
}
function loadUser() {
  try { return JSON.parse(localStorage.getItem('mc_auth')); } catch { return null; }
}

/* ── Normalize user từ BE response về shape FE dùng ── */
function normalizeUser(beUser, token) {
  return {
    id:       beUser.id       || beUser.userId,
    name:     beUser.fullName || beUser.name,
    email:    beUser.email,
    username: beUser.email,
    phone:    beUser.phone,
    // BE trả PATIENT/DOCTOR/ADMIN/STAFF → map về lowercase cho FE
    role:     (beUser.role || beUser.roleName || 'user').toLowerCase().replace('patient','user'),
    label:    { patient:'Người dùng', doctor:'Bác sĩ', admin:'Quản trị viên', staff:'Lễ tân / Nhân viên' }[
                (beUser.role || '').toLowerCase()
              ] || 'Người dùng',
    token,
    avatarUrl: beUser.imageUrl || beUser.avatarUrl || null,
  };
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(loadUser);
  const [loading, setLoading] = useState(false);

  /* Sync token vào localStorage mỗi khi user thay đổi */
  useEffect(() => {
    if (user) saveSession(user, user.token || '');
    else clearSession();
  }, [user]);

  /* ── Đăng nhập ── */
  const login = async ({ email, password, role }) => {
    setLoading(true);
    try {
      /* Thử gọi BE thật */
      const res = await authApi.login({ email, password });
      // BE trả: { token: "...", user: { ... } } hoặc { accessToken, ... }
      const token   = res.token || res.accessToken;
      const beUser  = res.user  || res;
      const normalized = normalizeUser(beUser, token);
      setUser(normalized);
      return { ok: true };
    } catch {
      /* Fallback mock khi chưa có BE */
      const found = MOCK_ACCOUNTS.find(
        (a) => (a.email === email || a.username === email)
             && a.password === password
             && (!role || a.role === role),
      );
      if (!found) {
        setLoading(false);
        return { ok: false, error: 'Tài khoản hoặc mật khẩu không đúng.' };
      }
      setUser(found);
      setLoading(false);
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  /* ── Đăng ký ── */
  const register = async ({ name, email, phone, password, cccd }) => {
    setLoading(true);
    try {
      const res = await authApi.register({ fullName: name, email, phone, password, cccd: cccd || '' });
      const token  = res.token || res.accessToken;
      const beUser = res.user  || res;
      const normalized = normalizeUser(beUser, token);
      setUser(normalized);
      return { ok: true };
    } catch (err) {
      /* Fallback mock */
      const exists = MOCK_ACCOUNTS.find((a) => a.email === email);
      if (exists) {
        setLoading(false);
        return { ok: false, error: 'Email này đã được đăng ký.' };
      }
      const newUser = {
        id: Date.now().toString(), username: email, email, phone,
        password, name, role: 'user', label: 'Người dùng', token: `mock-${Date.now()}`,
      };
      MOCK_ACCOUNTS.push(newUser);
      setUser(newUser);
      setLoading(false);
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  /* ── Đăng xuất ── */
  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
  };

  /* ── Cập nhật user local (sau khi update profile) ── */
  const updateLocalUser = (patch) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), loading, login, logout, register, updateLocalUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
