/**
 * AppSidebar — Layout dashboard với sidebar + topbar
 * ────────────────────────────────────────────────────
 * Sidebar: logo + nav links + bottom actions (về trang chủ, đăng xuất)
 *          KHÔNG hiển thị user info ở sidebar
 *
 * Topbar : ngày tháng | notification bell | avatar → dropdown (thông tin, đăng xuất)
 */
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount, getMyNotifications, markNotificationRead, markAllRead } from '../../api/notifications';

/* ── Nav theo role ── */
const NAV = {
  user: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/bookings',     icon: '📅', label: 'Lịch hẹn của tôi' },
    { to: '/dashboard/records',      icon: '📋', label: 'Hồ sơ sức khỏe' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt', disabled: true },
  ],
  doctor: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/schedule',     icon: '📅', label: 'Lịch khám' },
    { to: '/dashboard/patients',     icon: '👥', label: 'Bệnh nhân' },
    { to: '/dashboard/prescription', icon: '💊', label: 'Kê đơn thuốc' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt', disabled: true },
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
    { to: '/dashboard/payments',   icon: '💰', label: 'Thanh toán' },
    { to: '/dashboard/reports',    icon: '📊', label: 'Báo cáo' },
    { to: '/dashboard/settings',   icon: '⚙️', label: 'Cài đặt', disabled: true },
  ],
  staff: [
    { to: '/dashboard',              icon: '🏠', label: 'Tổng quan' },
    { to: '/dashboard/checkin',      icon: '✅', label: 'Quản lý lịch hẹn' },
    { to: '/dashboard/book-patient', icon: '📅', label: 'Đặt lịch nhanh' },
    { to: '/dashboard/my-settings',  icon: '⚙️', label: 'Cài đặt', disabled: true },
  ],
};

/* ── Màu accent theo role ── */
const ROLE_STYLE = {
  user:   { bg: 'bg-blue-600',   badge: 'bg-blue-100 text-blue-700',     label: 'Người dùng' },
  doctor: { bg: 'bg-green-600',  badge: 'bg-green-100 text-green-700',   label: 'Bác sĩ' },
  admin:  { bg: 'bg-slate-800',  badge: 'bg-red-100 text-red-700',       label: 'Admin' },
  staff:  { bg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700', label: 'Lễ tân' },
};

/* ── Route trang profile theo role ── */
const PROFILE_ROUTE = {
  user:   '/dashboard/profile',
  doctor: '/dashboard/profile',
  admin:  '/dashboard/profile',
  staff:  '/dashboard/profile',
};

export default function AppSidebar({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs,      setNotifs]      = useState([]);
  const [loadingNotif,setLoadingNotif]= useState(false);
  const dropRef  = useRef(null);
  const notifRef = useRef(null);

  const nav   = NAV[user.role]   || NAV.user;
  const style = ROLE_STYLE[user.role] || ROLE_STYLE.user;

  // ── Polling unread count mỗi 30s ──
  useEffect(() => {
    const loadCount = () => {
      getUnreadCount()
        .then(res => setUnreadCount(typeof res === 'number' ? res : Number(res) || 0))
        .catch(() => {});
    };
    loadCount();
    const timer = setInterval(loadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  // ── Mở notification panel → load danh sách ──
  const handleOpenNotif = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setDropOpen(false);
    if (next) {
      setLoadingNotif(true);
      try {
        const res = await getMyNotifications();
        setNotifs(Array.isArray(res) ? res : []);
      } catch { setNotifs([]); }
      finally { setLoadingNotif(false); }
    }
  };

  // ── Click notification → chỉ mark read, KHÔNG tự navigate ──
  // User tự quyết định xem trang hay không
  const handleNotifClick = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        // Re-sync count từ API
        getUnreadCount()
          .then(res => setUnreadCount(typeof res === 'number' ? res : Number(res) || 0))
          .catch(() => setUnreadCount(prev => Math.max(0, prev - 1)));
      } catch {}
    }
    // Không tự navigate — user bấm link riêng nếu muốn
  };

  // ── Đánh dấu tất cả đã đọc ──
  const handleMarkAllRead = async () => {
    try {
      await markAllRead(notifs);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  // ── Format thời gian tương đối ──
  const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    return `${d} ngày trước`;
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ── Sidebar component ── */
  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden md:flex'} flex-col h-full
      ${collapsed && !mobile ? 'w-16' : 'w-64'}
      bg-white border-r border-gray-100 transition-all duration-300
    `}>
      {/* ── Logo ── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            M
          </div>
          {(!collapsed || mobile) && (
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">MedCare</p>
              <p className="text-[10px] text-gray-400">Phòng khám đa khoa</p>
            </div>
          )}
        </Link>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
          item.disabled ? (
            /* Settings: "Sắp có" — không điều hướng */
            <div key={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed
                ${collapsed && !mobile ? 'justify-center' : ''}`}
              title="Chức năng sắp ra mắt"
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {(!collapsed || mobile) && (
                <span className="flex-1 flex items-center justify-between">
                  {item.label}
                  <span className="text-[9px] bg-gray-100 text-gray-400 font-bold px-1.5 py-0.5 rounded-full ml-1">Sắp có</span>
                </span>
              )}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
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
          )
        ))}
      </nav>

      {/* ── Bottom: về trang chủ + đăng xuất ── */}
      <div className="px-2 py-4 border-t border-gray-100 space-y-0.5">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
          onClick={() => mobile && setMobileOpen(false)}
        >
          <span className="text-base">🌐</span>
          {(!collapsed || mobile) && <span>Về trang chủ</span>}
        </Link>
        <button
          onClick={handleLogout}
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">

          {/* Left: hamburger (mobile) + collapse (desktop) + date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-4 h-0.5 bg-gray-600 mb-1 rounded" />
              <div className="w-4 h-0.5 bg-gray-600 mb-1 rounded" />
              <div className="w-4 h-0.5 bg-gray-600 rounded" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-400 text-sm"
            >
              {collapsed ? '→' : '←'}
            </button>
            <p className="hidden sm:block text-xs text-gray-400">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Right: notification + user avatar dropdown */}
          <div className="flex items-center gap-2">

            {/* ── Notification Bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotif}
                className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <span className="text-lg">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800 text-sm">Thông báo</p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <>
                          <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} chưa đọc
                          </span>
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-blue-600 hover:underline font-semibold"
                          >
                            Đọc tất cả
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotif ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifs.length === 0 ? (
                      <div className="py-10 text-center text-gray-400">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className="text-xs">Chưa có thông báo nào</p>
                      </div>
                    ) : notifs.map(n => (
                      <button key={n.id} onClick={() => handleNotifClick(n)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors
                          ${!n.isRead ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-start gap-2.5">
                          {/* Dot chưa đọc */}
                          <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* ── User avatar + dropdown ── */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className={`w-8 h-8 ${style.bg} rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.parentNode.textContent = user.name?.charAt(0) || '?'; }} />
                    : (user.name?.charAt(0) || '?')
                  }
                </div>
                {/* Tên + badge — ẩn trên mobile nhỏ */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                {/* Chevron */}
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ── Dropdown menu ── */}
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">

                  {/* Header dropdown — email */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  {/* ── Thông tin cá nhân ── */}
                  <div className="py-1">
                    <Link
                      to={PROFILE_ROUTE[user.role] || '/dashboard/profile'}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span>👤</span>
                      <span>Thông tin cá nhân</span>
                    </Link>

                    <Link
                      to="/dashboard/my-settings"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>Cài đặt</span>
                    </Link>
                  </div>

                  {/* ── Đăng xuất ── */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => { setDropOpen(false); handleLogout(); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
