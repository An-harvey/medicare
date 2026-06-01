import { Link } from 'react-router-dom';

/* ── Mock data ── */
const revenueData = [
  { month: 'T1', value: 85 },  { month: 'T2', value: 92 },
  { month: 'T3', value: 78 },  { month: 'T4', value: 110 },
  { month: 'T5', value: 128 }, { month: 'T6', value: 0 },
];

const topDoctors = [
  { name: 'GS.TS. Lê Minh Châu',   spec: 'Xương khớp', count: 42, rating: 4.9, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=60&h=60&fit=crop&crop=faces,top' },
  { name: 'PGS.TS. Nguyễn Văn An', spec: 'Tim mạch',   count: 38, rating: 4.9, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=60&h=60&fit=crop&crop=faces,top' },
  { name: 'TS.BS. Vũ Thị Phương',  spec: 'Mắt',        count: 35, rating: 4.8, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=faces,top' },
  { name: 'TS.BS. Trần Thị Bình',  spec: 'Thần kinh',  count: 31, rating: 4.8, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=60&h=60&fit=crop&crop=faces,top' },
  { name: 'ThS.BS. Phạm Thị Dung', spec: 'Nhi khoa',   count: 28, rating: 4.7, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=60&h=60&fit=crop&crop=faces,top' },
];

const specialtyStats = [
  { name: 'Tim mạch',   count: 38, pct: 30, color: 'bg-red-400' },
  { name: 'Xương khớp', count: 42, pct: 33, color: 'bg-blue-400' },
  { name: 'Thần kinh',  count: 31, pct: 24, color: 'bg-purple-400' },
  { name: 'Nhi khoa',   count: 28, pct: 22, color: 'bg-yellow-400' },
  { name: 'Da liễu',    count: 22, pct: 17, color: 'bg-green-400' },
  { name: 'Mắt',        count: 35, pct: 27, color: 'bg-pink-400' },
];

const systemAlerts = [
  { type: 'warning', msg: '4 lịch hẹn chưa được phân công bác sĩ', link: '/dashboard/schedule', action: 'Phân công ngay' },
  { type: 'info',    msg: '2 bác sĩ chưa cập nhật lịch tuần tới',   link: '/dashboard/schedule', action: 'Xem lịch' },
  { type: 'success', msg: 'Doanh thu tháng 5 tăng 18% so với tháng 4', link: '/dashboard/revenue', action: 'Xem báo cáo' },
];

const recentActivity = [
  { time: '08:32', icon: '👤', text: 'Người dùng mới đăng ký: Nguyễn Thị Hoa', type: 'user' },
  { time: '09:15', icon: '📅', text: 'Lịch hẹn #BK012 được tạo – Khám Tim mạch', type: 'booking' },
  { time: '10:00', icon: '✅', text: 'BS. Lê Minh Châu hoàn tất 3 ca khám sáng', type: 'done' },
  { time: '10:45', icon: '❌', text: 'Lịch hẹn #BK009 bị hủy bởi bệnh nhân', type: 'cancel' },
  { time: '11:20', icon: '👤', text: 'Người dùng mới đăng ký: Trần Văn Bình', type: 'user' },
  { time: '13:05', icon: '📅', text: 'Lịch hẹn #BK013 được tạo – Khám Mắt', type: 'booking' },
];

const ALERT_STYLE = {
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: '⚠️', text: 'text-yellow-800', btn: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  info:    { bg: 'bg-blue-50 border-blue-200',     icon: 'ℹ️',  text: 'text-blue-800',   btn: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  success: { bg: 'bg-green-50 border-green-200',   icon: '✅',  text: 'text-green-800',  btn: 'bg-green-100 text-green-800 hover:bg-green-200' },
};

/* ── Stat card ── */
function StatCard({ icon, label, value, delta, color, bg, border, to }) {
  return (
    <Link to={to || '#'} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm hover:shadow-md transition-all block`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-xl`}>{icon}</div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>{delta}</span>
      </div>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const maxRev = Math.max(...revenueData.map(d => d.value));

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-2xl font-extrabold text-gray-800 mt-0.5">Bảng điều khiển</h1>
          <p className="text-sm text-gray-400">Tổng quan hoạt động phòng khám MedCare</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/revenue"
            className="bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2">
            📊 Xem báo cáo
          </Link>
          <Link to="/dashboard/settings"
            className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            ⚙️ Cài đặt
          </Link>
        </div>
      </div>

      {/* ── System alerts ── */}
      <div className="space-y-2">
        {systemAlerts.map((a, i) => {
          const s = ALERT_STYLE[a.type];
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.bg}`}>
              <span className="text-base shrink-0">{s.icon}</span>
              <p className={`flex-1 text-sm font-medium ${s.text}`}>{a.msg}</p>
              <Link to={a.link} className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${s.btn}`}>
                {a.action}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Lịch hẹn hôm nay"  value="128"    delta="+12%" color="text-blue-600"   bg="bg-blue-50"   border="border-blue-200"   to="/dashboard/schedule" />
        <StatCard icon="👥" label="Người dùng"          value="932"    delta="+5%"  color="text-green-600"  bg="bg-green-50"  border="border-green-200"  to="/dashboard/users" />
        <StatCard icon="👨‍⚕️" label="Bác sĩ hoạt động"  value="42"     delta="0%"   color="text-purple-600" bg="bg-purple-50" border="border-purple-200" to="/dashboard/doctors" />
        <StatCard icon="💰" label="Doanh thu tháng 5"   value="128.5M" delta="+18%" color="text-orange-600" bg="bg-orange-50" border="border-orange-200" to="/dashboard/revenue" />
      </div>

      {/* ── Row 2: Chart + Top doctors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Doanh thu 6 tháng */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-800">Doanh thu 6 tháng đầu năm</h2>
              <p className="text-xs text-gray-400 mt-0.5">Đơn vị: triệu đồng · Tổng: 493.5M đ</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none">
                <option>2026</option><option>2025</option>
              </select>
              <Link to="/dashboard/revenue" className="text-xs text-blue-600 font-semibold hover:underline">Chi tiết →</Link>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-semibold">{d.value > 0 ? d.value : ''}</span>
                <div className="w-full rounded-t-xl transition-all relative group"
                  style={{ height: `${d.value > 0 ? (d.value / maxRev) * 100 : 6}%`, background: d.value > 0 ? (d.month === 'T5' ? '#1d4ed8' : '#93c5fd') : '#f3f4f6' }}>
                  {d.value > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.value}M đ
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold ${d.month === 'T5' ? 'text-blue-600' : 'text-gray-400'}`}>{d.month}</span>
              </div>
            ))}
          </div>
          {/* Mini stats dưới chart */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Tháng cao nhất', value: 'T5 · 128M', color: 'text-blue-600' },
              { label: 'Tháng thấp nhất', value: 'T3 · 78M',  color: 'text-red-500' },
              { label: 'Trung bình/tháng', value: '98.6M',    color: 'text-gray-700' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top bác sĩ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Top bác sĩ tháng 5</h2>
            <Link to="/dashboard/doctors" className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {topDoctors.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0
                  ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </span>
                <img src={d.img} alt={d.name} className="w-9 h-9 rounded-xl object-cover object-top shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-xs truncate">{d.name}</p>
                  <p className="text-[11px] text-gray-400">{d.spec} · ★{d.rating}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-blue-600">{d.count}</p>
                  <p className="text-[10px] text-gray-400">ca</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Specialty stats + Activity log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Thống kê theo chuyên khoa */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Lịch hẹn theo chuyên khoa</h2>
            <span className="text-xs text-gray-400">Tháng 5/2026</span>
          </div>
          <div className="space-y-3.5">
            {specialtyStats.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{s.name}</span>
                  <span className="text-gray-400 font-medium">{s.count} ca · {s.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Tổng: 196 ca trong tháng</span>
            <Link to="/dashboard/reports" className="text-blue-600 font-semibold hover:underline">Báo cáo đầy đủ →</Link>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Hoạt động hôm nay</h2>
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">Live</span>
          </div>
          <div className="space-y-0">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-base shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{a.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Quick actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '👥', label: 'Thêm người dùng',  to: '/dashboard/users',    color: 'hover:bg-blue-50 hover:border-blue-200' },
            { icon: '📅', label: 'Phân công lịch',   to: '/dashboard/schedule', color: 'hover:bg-slate-50 hover:border-slate-200' },
            { icon: '💰', label: 'Xem doanh thu',    to: '/dashboard/revenue',  color: 'hover:bg-orange-50 hover:border-orange-200' },
            { icon: '📊', label: 'Xuất báo cáo',     to: '/dashboard/reports',  color: 'hover:bg-green-50 hover:border-green-200' },
          ].map(a => (
            <Link key={a.label} to={a.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 transition-all ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
