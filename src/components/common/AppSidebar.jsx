import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  user: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/bookings',     icon: '📅', label: 'Lịch hẹn của tôi' },
    { to: '/dashboard/records',      icon: '📋', label: 'Hồ sơ sức khỏe' },
    { to: '/dashboard/profile',      icon: '👤', label: 'Thông tin cá nhân' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt' },
  ],
  doctor: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/schedule',     icon: '📅', label: 'Lịch khám' },
    { to: '/dashboard/patients',     icon: '👥', label: 'Bệnh nhân' },
    { to: '/dashboard/prescription', icon: '💊', label: 'Kê đơn thuốc' },
    { to: '/dashboard/profile',      icon: '👤', label: 'Hồ sơ bác sĩ' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt' },
  ],
  admin: [
    { to: '/dashboard',            icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/users',      icon: '👥', label: 'Người dùng' },
    { to: '/dashboard/doctors',    icon: '👨‍⚕️', label: 'Bác sĩ' },
    { to: '/dashboard/specialties',icon: '🏷️', label: 'Chuyên khoa' },
    { to: '/dashboard/diseases',   icon: '🦠', label: 'Bệnh lý (ICD)' },
    { to: '/dashboard/medicines',  icon: '💊', label: 'Danh mục thuốc' },
    { to: '/dashboard/time-slots', icon: '⏰', label: 'Khung giờ' },
    { to: '/dashboard/schedules',  icon: '📅', label: 'Lịch làm việc' },
    { to: '/dashboard/assign',     icon: '📋', label: 'Phân công lịch' },
    { to: '/dashboard/payments',   icon: '💰', label: 'Thanh toán' },
    { to: '/dashboard/reports',    icon: '📊', label: 'Báo cáo' },
    { to: '/dashboard/settings',   icon: '⚙️', label: 'Cài đặt' },
  ],
  staff: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/checkin',      icon: '✅', label: 'Check-in' },
    { to: '/dashboard/queue',        icon: '🔢', label: 'Hàng chờ' },
    { to: '/dashboard/bookings',     icon: '📅', label: 'Đặt lịch nhanh' },
    { to: '/dashboard/profile',      icon: '👤', label: 'Tài khoản' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt' },
  ],
};

const ROLE_STYLE = {
  user:   { bg: 'bg-blue-600',   badge: 'bg-blue-100 text-blue-700',   label: 'Người dùng' },
  doctor: { bg: 'bg-green-600',  badge: 'bg-green-100 text-green-700', label: 'Bác sĩ' },
  admin:  { bg: 'bg-slate-800',  badge: 'bg-red-100 text-red-700',     label: 'Admin' },
  staff:  { bg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700', label: 'Lễ tân' },
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav   = NAV[user.role]   || NAV.user;
  const style = ROLE_STYLE[user.role] || ROLE_STYLE.user;

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden md:flex'} flex-col h-full
      ${collapsed && !mobile ? 'w-16' : 'w-64'}
      bg-white border-r border-gray-100 transition-all duration-300
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0`}>M</div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">MedCare</p>
            <p className="text-[10px] text-gray-400">Phòng khám đa khoa</p>
          </div>
        )}
      </div>

      {/* User info */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${style.bg} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? `${style.bg} text-white shadow-sm`
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
              ${collapsed && !mobile ? 'justify-center' : ''}
            `}
            onClick={() => mobile && setMobileOpen(false)}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-gray-100 space-y-0.5">
        <Link to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
          onClick={() => mobile && setMobileOpen(false)}
        >
          <span className="text-base">🌐</span>
          {(!collapsed || mobile) && <span>Về trang chủ</span>}
        </Link>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <span className="text-base">🚪</span>
          {(!collapsed || mobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-64 h-full bg-white shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <div className="w-4 h-0.5 bg-gray-600 mb-1 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-600 mb-1 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              {collapsed ? '→' : '←'}
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${style.bg} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-700">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
