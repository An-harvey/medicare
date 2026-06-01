import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const ROLE_META = {
  user:   { label: 'Người dùng', color: 'bg-blue-100 text-blue-700',     icon: '👤' },
  doctor: { label: 'Bác sĩ',     color: 'bg-green-100 text-green-700',   icon: '👨‍⚕️' },
  admin:  { label: 'Admin',       color: 'bg-red-100 text-red-700',       icon: '🛡️' },
  staff:  { label: 'Lễ tân',      color: 'bg-purple-100 text-purple-700', icon: '🏥' },
};

const NAV_LINKS = [
  { to: '/',         label: 'Trang chủ', end: true },
  { to: '/doctors',  label: 'Bác sĩ' },
  { to: '/packages', label: 'Gói khám' },
  { to: '/news',     label: 'Tin tức' },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };
  const roleMeta = user ? ROLE_META[user.role] : null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">

      {/* ── Top bar ── */}
      <div className="bg-blue-700 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>📞 Hotline: <strong>1800 599 920</strong> (Miễn phí)</span>
            <span className="hidden sm:inline">⏰ T2–T7: 7:00–20:00 | CN: 7:00–12:00</span>
          </div>
          <span className="hidden sm:inline">✉️ info@medcare.vn</span>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">M</div>
          <div>
            <div className="text-lg font-bold text-blue-700 leading-tight">MedCare</div>
            <div className="text-[10px] text-gray-400 leading-tight">Phòng khám đa khoa</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => isActive
                ? 'text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600 transition-colors'}>
              {l.label}
            </NavLink>
          ))}
          <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">Giới thiệu</a>
        </nav>

        {/* Right area */}
        <div className="hidden md:flex items-center gap-2">

          {/* Search */}
          <Link to="/search" title="Tìm kiếm"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Notification */}
              <NotificationPanel />

              {/* User dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleMeta.color}`}>
                      {roleMeta.icon} {roleMeta.label}
                    </span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email || user.username}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleMeta.color}`}>
                        {roleMeta.icon} {roleMeta.label}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link to="/dashboard" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <span>📊</span><span>Dashboard</span>
                      </Link>
                      <Link to="/dashboard/profile" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <span>👤</span><span>Thông tin cá nhân</span>
                      </Link>
                      {user.role === 'user' && (
                        <>
                          <Link to="/dashboard/bookings" onClick={() => setDropOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <span>📅</span><span>Lịch hẹn của tôi</span>
                          </Link>
                          <Link to="/doctors" onClick={() => setDropOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <span>➕</span><span>Đặt lịch khám</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <span>🚪</span><span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2">
                Đăng nhập
              </Link>
              <Link to="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`w-5 h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></div>
          <div className={`w-5 h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? 'opacity-0' : 'mb-1.5'}`}></div>
          <div className={`w-5 h-0.5 bg-gray-600 rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/search" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}>
            🔍 Tìm kiếm
          </Link>

          <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleMeta?.color}`}>
                      {roleMeta?.icon} {roleMeta?.label}
                    </span>
                  </div>
                </div>
                {[
                  { to:'/dashboard',          label:'📊 Dashboard' },
                  { to:'/dashboard/profile',  label:'👤 Thông tin cá nhân' },
                  ...(user.role === 'user' ? [{ to:'/dashboard/bookings', label:'📅 Lịch hẹn của tôi' }] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to}
                    className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium">
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="block px-3 py-3 rounded-xl text-sm text-center border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register"
                  className="block px-3 py-3 rounded-xl text-sm text-center bg-blue-600 text-white font-bold hover:bg-blue-700"
                  onClick={() => setMenuOpen(false)}>
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
