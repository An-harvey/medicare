import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctorUpcoming, useDoctorStatistics } from '../../hooks/useAppointments';
import { formatDate, formatTime } from '../../utils/formatters';

const STATUS_STYLE = {
  PENDING:     { label: 'Chờ',       cls: 'bg-yellow-100 text-yellow-700' },
  ARRIVED:     { label: 'Đã đến',    cls: 'bg-green-100 text-green-700' },
  IN_PROGRESS: { label: 'Đang khám', cls: 'bg-blue-100 text-blue-700 animate-pulse' },
  COMPLETED:   { label: 'Đã khám',   cls: 'bg-gray-100 text-gray-500' },
  CANCELLED:   { label: 'Đã hủy',    cls: 'bg-red-100 text-red-500' },
  NO_SHOW:     { label: 'Vắng',      cls: 'bg-orange-100 text-orange-600' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: upcoming, loading: loadingUpcoming, error: upcomingError } = useDoctorUpcoming();
  const { data: stats, loading: loadingStats } = useDoctorStatistics();
  const [selected, setSelected] = useState(null);

  const todayPatients = useMemo(
    () => upcoming,
    [upcoming],
  );

  const statCards = [
    { icon: '👥', label: 'Bệnh nhân hôm nay', value: todayPatients.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: '✅', label: 'Đã khám tuần này', value: stats?.totalExaminedThisWeek ?? '—', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: '⏳', label: 'Đang chờ khám', value: stats?.totalPendingAppointments ?? '—', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: '📋', label: 'Đã khám tháng này', value: stats?.totalExaminedThisMonth ?? '—', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const loading = loadingUpcoming || loadingStats;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">{formatDate(new Date().toISOString().split('T')[0])}</p>
          <h1 className="text-2xl font-extrabold text-gray-800">Bệnh nhân cần khám</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Xin chào, <span className="font-semibold text-green-600">{user?.name || user?.email}</span>
          </p>
        </div>
        <Link to="/dashboard/prescription"
          className="bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-center">
          + Tạo bệnh án
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{loading ? '…' : s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Lịch hẹn sắp tới</h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">{todayPatients.length}</span>
          </div>
          {upcomingError && (
            <p className="px-5 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">{upcomingError}</p>
          )}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todayPatients.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">Không có bệnh nhân chờ khám</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayPatients.map(p => {
                const st = STATUS_STYLE[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <button key={p.appointmentId} onClick={() => setSelected(p)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left ${selected?.appointmentId === p.appointmentId ? 'bg-blue-50' : ''}`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {p.patientName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{p.patientName}</p>
                      <p className="text-xs text-gray-400 truncate">{p.symptoms || '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-600">{formatTime(p.startTime)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 sticky top-6">
              <h3 className="font-bold text-gray-800">{selected.patientName}</h3>
              <p className="text-xs text-gray-500">⏰ {formatTime(selected.startTime)} · {formatDate(selected.workDate)}</p>
              <p className="text-sm text-gray-600"><span className="font-semibold">Triệu chứng:</span> {selected.symptoms || '—'}</p>
              <Link to="/dashboard/prescription" state={{ appointmentId: selected.appointmentId }}
                className="block text-center bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-700">
                Kê đơn / Tạo bệnh án
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-sm">Chọn bệnh nhân để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
