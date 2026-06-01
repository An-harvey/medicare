import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NOTIFS_BY_ROLE = {
  user: [
    { id:1, type:'booking',  title:'Lịch hẹn được xác nhận',       body:'Lịch khám Tim mạch ngày 27/05 lúc 09:00 đã được xác nhận.',  time:'5 phút trước',  read:false, link:'/dashboard/bookings', icon:'✅' },
    { id:2, type:'reminder', title:'Nhắc nhở lịch khám ngày mai',   body:'Bạn có lịch khám với BS. Nguyễn Văn An vào 09:00 ngày mai.', time:'1 giờ trước',   read:false, link:'/dashboard/bookings', icon:'🔔' },
    { id:3, type:'news',     title:'Bài viết mới: Sức khỏe tim mạch', body:'5 dấu hiệu cảnh báo bệnh tim mạch bạn không nên bỏ qua.',  time:'2 giờ trước',   read:true,  link:'/news/1',             icon:'📰' },
    { id:4, type:'promo',    title:'Ưu đãi gói khám tháng 6',       body:'Giảm 20% gói Khám Toàn Diện từ 01–30/06/2026.',             time:'1 ngày trước',  read:true,  link:'/packages',           icon:'🎁' },
  ],
  doctor: [
    { id:1, type:'booking',  title:'Bệnh nhân mới đặt lịch',        body:'Phạm Thu Hà đặt lịch khám Tim mạch lúc 09:00 ngày 27/05.',  time:'10 phút trước', read:false, link:'/dashboard/schedule', icon:'📅' },
    { id:2, type:'system',   title:'Lịch ca tuần tới đã được cập nhật', body:'Admin đã cập nhật lịch ca tuần 02–08/06/2026.',          time:'2 giờ trước',   read:false, link:'/dashboard/schedule', icon:'📋' },
    { id:3, type:'reminder', title:'Còn 3 bệnh nhân chờ hôm nay',   body:'Nguyễn Thị Mai, Trần Minh Đức, Hoàng Thị Lan đang chờ.',   time:'30 phút trước', read:true,  link:'/dashboard',          icon:'👥' },
  ],
  admin: [
    { id:1, type:'alert',    title:'4 lịch hẹn chưa phân công',     body:'Có 4 lịch hẹn mới chưa được phân công bác sĩ.',             time:'15 phút trước', read:false, link:'/dashboard/schedule', icon:'⚠️' },
    { id:2, type:'system',   title:'Người dùng mới đăng ký',        body:'Nguyễn Thị Hoa vừa đăng ký tài khoản mới.',                 time:'1 giờ trước',   read:false, link:'/dashboard/users',    icon:'👤' },
    { id:3, type:'revenue',  title:'Doanh thu tháng 5 đạt mục tiêu', body:'Doanh thu 128.5M đ, vượt mục tiêu 18%.',                   time:'3 giờ trước',   read:true,  link:'/dashboard/revenue',  icon:'💰' },
  ],
  staff: [
    { id:1, type:'checkin',  title:'Bệnh nhân đến sớm',             body:'Đỗ Minh Khoa đã đến phòng khám, chờ check-in.',             time:'5 phút trước',  read:false, link:'/dashboard/checkin',  icon:'🏥' },
    { id:2, type:'booking',  title:'Lịch hẹn mới từ online',        body:'Vũ Thị Nga đặt lịch khám Tim mạch ngày 28/05 lúc 09:00.',   time:'20 phút trước', read:false, link:'/dashboard/checkin',  icon:'📅' },
    { id:3, type:'system',   title:'Phòng P102 vừa trống',          body:'BS. Trần Thị Bình đã hoàn tất ca khám, phòng P102 sẵn sàng.', time:'1 giờ trước', read:true,  link:'/dashboard',          icon:'✅' },
  ],
};

const TYPE_COLOR = {
  booking:  'bg-blue-100 text-blue-600',
  reminder: 'bg-yellow-100 text-yellow-600',
  news:     'bg-purple-100 text-purple-600',
  promo:    'bg-green-100 text-green-600',
  alert:    'bg-red-100 text-red-600',
  system:   'bg-gray-100 text-gray-600',
  revenue:  'bg-orange-100 text-orange-600',
  checkin:  'bg-teal-100 text-teal-600',
};

export default function NotificationPanel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS_BY_ROLE[user?.role] || []);
  const ref = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markOne = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-sm">Thông báo</h3>
              {unread > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread} mới</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-blue-600 hover:underline font-medium">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : notifs.map(n => (
              <Link key={n.id} to={n.link}
                onClick={() => { markOne(n.id); setOpen(false); }}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${TYPE_COLOR[n.type]}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${!n.read ? 'text-gray-800' : 'text-gray-600'}`}>{n.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link to="/dashboard" onClick={() => setOpen(false)}
              className="text-xs text-blue-600 font-semibold hover:underline">
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
