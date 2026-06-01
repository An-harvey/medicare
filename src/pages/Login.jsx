import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../context/AuthContext';

const ROLES = [
  { value: 'user',   label: 'Người dùng', icon: '👤', hint: 'user / user123' },
  { value: 'doctor', label: 'Bác sĩ',     icon: '👨‍⚕️', hint: 'doctor / doctor123' },
  { value: 'admin',  label: 'Admin',       icon: '🛡️', hint: 'admin / admin123' },
  { value: 'staff',  label: 'Lễ tân',      icon: '🏥', hint: 'staff / staff123' },
];

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const [role, setRole]         = useState('user');
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from || ROLE_HOME[user.role]} replace />;
  }

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // giả lập network
    const result = login({ ...form, role });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    navigate(from || ROLE_HOME[role], { replace: true });
  };

  const fillDemo = (r) => {
    setRole(r.value);
    const [u, p] = r.hint.split(' / ');
    setForm({ username: u, password: p });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* ── Left panel ── */}
        <div className="md:w-2/5 bg-gradient-to-br from-blue-800 to-blue-600 p-8 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
              <span className="font-bold text-lg">MedCare</span>
            </Link>
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">Chào mừng<br />trở lại!</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Đăng nhập để đặt lịch khám, quản lý hồ sơ và truy cập giao diện phù hợp với vai trò của bạn.
            </p>
          </div>

          {/* Role cards */}
          <div className="space-y-2 mt-8">
            {ROLES.map((r) => (
              <button key={r.value} onClick={() => fillDemo(r)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all text-sm ${
                  role === r.value ? 'bg-white text-blue-700 font-bold shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="font-semibold leading-tight">{r.label}</p>
                  <p className={`text-[11px] ${role === r.value ? 'text-blue-400' : 'text-blue-200'}`}>{r.hint}</p>
                </div>
                {role === r.value && <span className="ml-auto text-blue-500">✓</span>}
              </button>
            ))}
          </div>

          <p className="text-blue-200 text-xs mt-6">
            Click vào role để điền tự động tài khoản mẫu
          </p>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Đăng nhập</h2>
            <p className="text-sm text-gray-400 mb-7">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Đăng ký ngay</Link>
            </p>

            {/* Role selector pills */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {ROLES.map((r) => (
                <button key={r.value} onClick={() => { setRole(r.value); setError(''); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    role === r.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  <span>{r.icon}</span>{r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <span className="shrink-0">⚠️</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Tên đăng nhập</label>
                <input name="username" value={form.username} onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" /> Ghi nhớ đăng nhập
                </label>
                <a href="#" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Đang đăng nhập...</>
                ) : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <Link to="/" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
