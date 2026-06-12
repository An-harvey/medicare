import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400'];

const ALERT_STYLE = {
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: '⚠️', text: 'text-yellow-800', btn: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  info:    { bg: 'bg-blue-50 border-blue-200',     icon: 'ℹ️',  text: 'text-blue-800',   btn: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  success: { bg: 'bg-green-50 border-green-200',   icon: '✅',  text: 'text-green-800',  btn: 'bg-green-100 text-green-800 hover:bg-green-200' },
};

function formatDelta(item) {
  if (!item || item.percentageChange == null) return '—';
  const sign = item.isIncrease ? '+' : '';
  return `${sign}${item.percentageChange}%`;
}

function StatCard({ icon, label, value, delta, color, bg, border, to }) {
  return (
    <Link to={to || '#'} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm hover:shadow-md transition-all block`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-xl`}>{icon}</div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>{delta}</span>
      </div>
      <p className={`text-2xl font-extrabold ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const { kpi, revenue, topDoctors, specialtyStats, alerts, activities, loading, error } = useAdminDashboard();

  const revenueData = (revenue?.data || []).map(d => ({
    month: (d.month || '').replace('Tháng ', 'T'),
    value: Math.round((d.revenue || 0) / 1_000_000),
  }));
  const maxRev = Math.max(...(revenueData.length ? revenueData.map(d => d.value) : [1]), 1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-2xl font-extrabold text-gray-800 mt-0.5">Bảng điều khiển</h1>
          <p className="text-sm text-gray-400">Tổng quan hoạt động phòng khám MedCare</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/reports" className="bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">📊 Xem báo cáo</Link>
          <Link to="/dashboard/settings" className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">⚙️ Cài đặt</Link>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const s = ALERT_STYLE[a.type] || ALERT_STYLE.info;
            const link = a.actionLink?.startsWith('/admin')
              ? a.actionLink.replace('/admin', '/dashboard').replace('/appointments', '/schedules')
              : a.actionLink || '/dashboard';
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.bg}`}>
                <span className="text-base shrink-0">{s.icon}</span>
                <p className={`flex-1 text-sm font-medium ${s.text}`}>{a.message}</p>
                <Link to={link} className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${s.btn}`}>Xem</Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Lịch hẹn hôm nay" value={kpi?.todayAppointments?.value} delta={formatDelta(kpi?.todayAppointments)} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" to="/dashboard/schedules" />
        <StatCard icon="👥" label="Người dùng" value={kpi?.totalUsers?.value} delta={formatDelta(kpi?.totalUsers)} color="text-green-600" bg="bg-green-50" border="border-green-200" to="/dashboard/users" />
        <StatCard icon="👨‍⚕️" label="Bác sĩ hoạt động" value={kpi?.activeDoctors?.value} delta={formatDelta(kpi?.activeDoctors)} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" to="/dashboard/doctors" />
        <StatCard icon="💰" label="Doanh thu tháng" value={kpi?.monthlyRevenue?.value} delta={formatDelta(kpi?.monthlyRevenue)} color="text-orange-600" bg="bg-orange-50" border="border-orange-200" to="/dashboard/payments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-800">Doanh thu theo tháng</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tổng: {revenue?.totalRevenue ? `${Math.round(revenue.totalRevenue / 1_000_000)}M đ` : '—'}</p>
            </div>
            <Link to="/dashboard/payments" className="text-xs text-blue-600 font-semibold hover:underline">Chi tiết →</Link>
          </div>
          {revenueData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Chưa có dữ liệu doanh thu</p>
          ) : (
            <>
              <div className="flex items-end gap-3 h-40">
                {revenueData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 font-semibold">{d.value > 0 ? d.value : ''}</span>
                    <div className="w-full rounded-t-xl bg-blue-400 transition-all" style={{ height: `${d.value > 0 ? (d.value / maxRev) * 100 : 6}%`, minHeight: 4 }} />
                    <span className="text-[11px] font-semibold text-gray-400">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
                <div className="text-center"><p className="text-sm font-extrabold text-blue-600">{revenue?.highestMonth || '—'}</p><p className="text-[10px] text-gray-400">Cao nhất</p></div>
                <div className="text-center"><p className="text-sm font-extrabold text-red-500">{revenue?.lowestMonth || '—'}</p><p className="text-[10px] text-gray-400">Thấp nhất</p></div>
                <div className="text-center"><p className="text-sm font-extrabold text-gray-700">{revenue?.averagePerMonth ? `${Math.round(revenue.averagePerMonth / 1_000_000)}M` : '—'}</p><p className="text-[10px] text-gray-400">TB/tháng</p></div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Top bác sĩ</h2>
            <Link to="/dashboard/doctors" className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</Link>
          </div>
          {topDoctors.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : topDoctors.map((d, i) => (
            <div key={d.doctorId || i} className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-xs truncate">{d.name}</p>
                <p className="text-[11px] text-gray-400">{d.specialty} · {d.academicTitle}</p>
              </div>
              <p className="text-xs font-extrabold text-blue-600">{d.totalAppointments} ca</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5">Lịch hẹn theo chuyên khoa</h2>
          {specialtyStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : specialtyStats.map((s, i) => (
            <div key={s.specialtyId || i} className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700">{s.specialtyName}</span>
                <span className="text-gray-400">{s.appointmentCount} ca · {s.percentage?.toFixed?.(1) ?? s.percentage}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${COLORS[i % COLORS.length]} rounded-full`} style={{ width: `${Math.min(s.percentage || 0, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5">Hoạt động hôm nay</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có hoạt động</p>
          ) : activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-b-0">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-base shrink-0">📋</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600 font-semibold">{a.activityType}</p>
                <p className="text-sm text-gray-700">{a.description}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{(a.time || '').substring(0, 5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
