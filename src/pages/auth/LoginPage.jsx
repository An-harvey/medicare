/**
 * LoginPage — /login
 * ────────────────────
 * POST /api/auth/login → { token, email, role }
 * Redirect theo role (lo_trinh.txt mục 8.1):
 *   ADMIN/DOCTOR/STAFF/PATIENT → /dashboard
 */
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTE } from '../../utils/constants';
import { getRedirectPath } from '../../utils/navigation';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = getRedirectPath(location.state);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Thông báo thành công từ trang Register
  const successMsg = location.state?.successMsg;

  if (isAuthenticated) {
    return <Navigate to={from || ROLE_HOME_ROUTE[user.role] || '/dashboard'} replace />;
  }

  const handleChange = e => {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    const result = await login({ email: form.email.trim(), password: form.password });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    // Redirect đúng route theo role trả về từ BE
    navigate(from || ROLE_HOME_ROUTE[result.role] || '/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
              <div>
                <p className="font-extrabold text-gray-800 leading-tight">MedCare</p>
                <p className="text-[10px] text-gray-400">Phòng khám đa khoa</p>
              </div>
            </Link>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Đăng nhập</h2>
          <p className="text-sm text-gray-400 mb-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">Đăng ký ngay</Link>
          </p>

          {/* Thông báo đăng ký thành công */}
          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <span>✅</span>{successMsg}
            </div>
          )}

          {/* Lỗi */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Ghi nhớ & quên mật khẩu */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-blue-50 px-8 py-4 border-t border-blue-100">
          <p className="text-xs text-blue-600 text-center">
            🔒 Thông tin đăng nhập được mã hóa và bảo mật tuyệt đối
          </p>
        </div>
      </div>
    </div>
  );
}
