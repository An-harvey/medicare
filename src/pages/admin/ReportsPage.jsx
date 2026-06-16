/**
 * ReportsPage — Báo cáo thống kê
 * ────────────────────────────────
 * Role: ADMIN
 * APIs (từ useAdminDashboard):
 *   GET /admin/dashboard/kpi-summary    → KPI tổng quan
 *   GET /admin/dashboard/revenue?year=  → Doanh thu theo tháng
 *   GET /admin/dashboard/top-doctors    → Top bác sĩ
 *   GET /admin/dashboard/specialties    → Thống kê theo chuyên khoa
 */
import { useState } from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { formatCurrency } from '../../utils/formatters';

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { kpi, revenue, topDoctors, specialtyStats, loading, error } = useAdminDashboard(year);

  // Chuẩn bị data biểu đồ doanh thu
  const revenueData = (revenue?.data || []).map(d => ({
    month: (d.month || '').replace('Tháng ', 'T'),
    value: Math.round((d.revenue || 0) / 1_000_000),
  }));
  const maxRev = Math.max(...revenueData.map(d => d.value), 1);

  const COLORS = ['bg-red-400','bg-blue-400','bg-purple-400','bg-yellow-400','bg-green-400','bg-pink-400'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Báo cáo thống kê</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng hợp hoạt động phòng khám</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none bg-white"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
          >
            🖨️ In báo cáo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          ⚠️ {error}
        </div>
      )}

      {/* ── KPI tổng quan ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Lịch hẹn hôm nay', value: kpi?.todayAppointments?.value, color:'text-blue-600',   bg:'bg-blue-50',   delta: kpi?.todayAppointments },
          { label:'Tổng người dùng',   value: kpi?.totalUsers?.value,        color:'text-green-600',  bg:'bg-green-50',  delta: kpi?.totalUsers },
          { label:'Bác sĩ hoạt động',  value: kpi?.activeDoctors?.value,     color:'text-purple-600', bg:'bg-purple-50', delta: kpi?.activeDoctors },
          { label:'Doanh thu tháng',   value: kpi?.monthlyRevenue?.value,    color:'text-orange-600', bg:'bg-orange-50', delta: kpi?.monthlyRevenue },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            {loading ? (
              <div className="w-8 h-8 bg-white/50 rounded-lg animate-pulse mb-2" />
            ) : (
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value ?? '—'}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            {s.delta?.percentageChange != null && (
              <p className={`text-[10px] font-semibold mt-1 ${s.delta.isIncrease ? 'text-green-600' : 'text-red-500'}`}>
                {s.delta.isIncrease ? '↑' : '↓'} {Math.abs(s.delta.percentageChange)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Biểu đồ doanh thu ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-gray-800">Doanh thu theo tháng — {year}</h2>
            {revenue?.totalRevenue && (
              <p className="text-xs text-gray-400 mt-0.5">
                Tổng: <strong className="text-blue-600">{formatCurrency(revenue.totalRevenue)}</strong>
                {revenue.highestMonth && ` · Cao nhất: ${revenue.highestMonth}`}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Đang tải...</div>
        ) : revenueData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu doanh thu</div>
        ) : (
          <>
            <div className="flex items-end gap-2 h-44">
              {revenueData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">{d.value > 0 ? `${d.value}M` : ''}</span>
                  <div
                    className="w-full rounded-t-xl bg-blue-500 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max((d.value / maxRev) * 140, 4)}px` }}
                    title={`${d.month}: ${d.value}M đ`}
                  />
                  <span className="text-[10px] font-semibold text-gray-400">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100 text-center text-xs">
              <div>
                <p className="font-extrabold text-blue-600">{revenue?.highestMonth || '—'}</p>
                <p className="text-gray-400">Tháng cao nhất</p>
              </div>
              <div>
                <p className="font-extrabold text-red-500">{revenue?.lowestMonth || '—'}</p>
                <p className="text-gray-400">Tháng thấp nhất</p>
              </div>
              <div>
                <p className="font-extrabold text-gray-700">
                  {revenue?.averagePerMonth ? `${Math.round(revenue.averagePerMonth / 1_000_000)}M` : '—'}
                </p>
                <p className="text-gray-400">Trung bình/tháng</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Top bác sĩ ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Top bác sĩ tháng này</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : topDoctors.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : topDoctors.slice(0, 5).map((d, i) => (
            <div key={d.doctorId || i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                i === 0 ? 'bg-yellow-400 text-yellow-900' :
                i === 1 ? 'bg-gray-300 text-gray-700' :
                i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{d.name}</p>
                <p className="text-xs text-gray-400">{d.specialty} · {d.academicTitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-blue-600">{d.totalAppointments} ca</p>
                {d.rating && <p className="text-[10px] text-yellow-500">★ {d.rating}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Thống kê theo chuyên khoa ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Lịch hẹn theo chuyên khoa</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : specialtyStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : specialtyStats.map((s, i) => (
            <div key={s.specialtyId || i} className="mb-4 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700">{s.specialtyName}</span>
                <span className="text-gray-400">
                  {s.appointmentCount} ca · {s.percentage?.toFixed?.(1) ?? s.percentage}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${COLORS[i % COLORS.length]} rounded-full transition-all`}
                  style={{ width: `${Math.min(s.percentage || 0, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
