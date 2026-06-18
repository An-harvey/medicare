/**
 * ForgotPasswordPage — Quên mật khẩu (lo_trinh.txt §18)
 * ─────────────────────────────────────────────────────────
 * Bước 1: Nhập email → POST /auth/forgot-password → nhận OTP
 * Bước 2: Nhập OTP + mật khẩu mới → POST /auth/reset-password
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authForgotPassword, authResetPassword } from '../../api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1); // 1 = nhập email, 2 = nhập OTP
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  // Countdown 5 phút
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Bước 1: Gửi OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }
    setLoading(true);
    setError('');
    try {
      await authForgotPassword(email.trim());
      setSuccess('Mã OTP đã được gửi đến email của bạn. Kiểm tra hộp thư!');
      setStep(2);
      startCountdown();
    } catch (err) {
      const msg = err?.message || '';
      if (err?.status === 404) setError('Email không tồn tại trong hệ thống.');
      else setError(msg || 'Gửi OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Xác nhận OTP + đặt mật khẩu mới ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim())   { setError('Vui lòng nhập mã OTP.'); return; }
    if (!newPass)      { setError('Vui lòng nhập mật khẩu mới.'); return; }
    if (newPass !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    setLoading(true);
    setError('');
    try {
      await authResetPassword(email.trim(), otp.trim(), newPass);
      navigate('/login', { state: { successMsg: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      const msg = err?.message || '';
      if (err?.status === 400 && msg.includes('hết hạn')) setError('Mã OTP đã hết hạn. Vui lòng gửi lại.');
      else if (err?.status === 400) setError('Mã OTP không đúng. Vui lòng kiểm tra lại.');
      else setError(msg || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    try {
      await authForgotPassword(email.trim());
      setSuccess('Đã gửi lại OTP mới!');
      startCountdown();
    } catch { setError('Gửi lại OTP thất bại.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/login" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
              <div>
                <p className="font-extrabold text-gray-800 leading-tight">MedCare</p>
                <p className="text-[10px] text-gray-400">Phòng khám đa khoa</p>
              </div>
            </Link>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {['Nhập email', 'Đặt mật khẩu'].map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i + 1 < step ? 'bg-green-500 text-white' :
                  i + 1 === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="ml-1.5 text-xs font-medium text-gray-500 hidden sm:inline">{label}</span>
                {i === 0 && <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Quên mật khẩu</h2>
              <p className="text-sm text-gray-400 mb-6">Nhập email để nhận mã OTP đặt lại mật khẩu</p>

              {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">⚠️ {error}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang gửi...</> : 'Gửi mã OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Đặt mật khẩu mới</h2>
              <p className="text-sm text-gray-400 mb-2">OTP đã gửi đến <strong>{email}</strong></p>

              {countdown > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-700 flex items-center justify-between">
                  <span>⏱️ Mã hết hạn sau</span>
                  <span className="font-bold font-mono">{formatTime(countdown)}</span>
                </div>
              )}

              {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">✅ {success}</div>}
              {error   && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">⚠️ {error}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Mã OTP (6 chữ số)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-center tracking-[0.5em] text-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                  />
                </div>
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang xử lý...</> : 'Đặt lại mật khẩu'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-xs text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {countdown > 0 ? `Gửi lại sau ${formatTime(countdown)}` : '↻ Gửi lại OTP'}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-blue-600">← Quay về đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
