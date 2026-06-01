import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [agree, setAgree]     = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim())  return 'Vui lòng nhập họ và tên.';
    if (!form.email.includes('@')) return 'Email không hợp lệ.';
    if (!/^0\d{9}$/.test(form.phone)) return 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).';
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp.';
    if (!agree) return 'Vui lòng đồng ý với điều khoản sử dụng.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = register(form);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    navigate('/dashboard', { replace: true });
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][strength];

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
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">Tạo tài khoản<br />miễn phí</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Đăng ký để đặt lịch khám nhanh chóng, theo dõi hồ sơ sức khỏe và nhận thông báo lịch hẹn.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            {[
              { icon: '📅', title: 'Đặt lịch 24/7', desc: 'Chọn bác sĩ và giờ khám bất kỳ lúc nào' },
              { icon: '📋', title: 'Hồ sơ sức khỏe', desc: 'Lưu trữ lịch sử khám và đơn thuốc' },
              { icon: '🔔', title: 'Nhắc nhở tự động', desc: 'SMS/Email nhắc lịch hẹn trước 24h' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 bg-white/10 rounded-2xl p-4">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Đăng ký</h2>
            <p className="text-sm text-gray-400 mb-6">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập</Link>
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <span className="shrink-0">⚠️</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>

              {/* SĐT */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="0912 345 678"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] font-medium ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-300'
                  }`} />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Điều khoản */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                  className="accent-blue-600 mt-0.5 w-4 h-4 shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng</a> và{' '}
                  <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a> của MedCare
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Đang tạo tài khoản...</>
                ) : 'Tạo tài khoản'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
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
