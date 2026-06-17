import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctorUpcoming, useDoctorStatistics } from '../../hooks/useAppointments';
import { formatDate, formatTime } from '../../utils/formatters';
import { doctorUpdateAppointmentStatus } from '../../api/doctor';

// ── Doctor: đúng theo BE enum ──
// PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
const STATUS_STYLE = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700' },
  CHECK_IN:    { label: '🔔 Đã vào phòng chờ', cls: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: '⚕️ Đang khám', cls: 'bg-green-100 text-green-700' },
  COMPLETED:   { label: 'Đã khám',      cls: 'bg-gray-100 text-gray-500' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-500' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: upcoming, loading: loadingUpcoming, error: upcomingError, refetch } = useDoctorUpcoming();
  const { data: stats, loading: loadingStats } = useDoctorStatistics();
  const [selected,   setSelected]   = useState(null);
  // localList: bản sao local của upcoming để giữ IN_PROGRESS sau khi bác sĩ bắt đầu khám
  // BE /upcoming không trả IN_PROGRESS → cần giữ local
  const [localList,  setLocalList]  = useState(null);
  const [updating,   setUpdating]   = useState(false);
  const [toast,      setToast]      = useState('');

  // Dùng localList nếu có, ngược lại dùng data từ hook
  const displayList = localList ?? upcoming;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  // Bác sĩ bắt đầu khám: CHECK_IN → IN_PROGRESS
  // Sau khi thành công → tự động chuyển sang màn kê đơn / hồ sơ bệnh án
  const handleStartExam = async (appt) => {
    setUpdating(true);
    try {
      await doctorUpdateAppointmentStatus(appt.appointmentId, 'IN_PROGRESS');
      // Cập nhật local list — giữ phiếu trong danh sách với status mới
      setLocalList(prev => {
        const base = prev ?? upcoming;
        return base.map(a =>
          a.appointmentId === appt.appointmentId ? { ...a, status: 'IN_PROGRESS' } : a
        );
      });
      setSelected(prev => prev?.appointmentId === appt.appointmentId
        ? { ...prev, status: 'IN_PROGRESS' } : prev);
      showToast(`⚕️ Bắt đầu khám: ${appt.patientName}`);
      // Tự động chuyển sang màn kê đơn thuốc / tạo hồ sơ bệnh án
      navigate('/dashboard/prescription', { state: { appointmentId: appt.appointmentId } });
    } catch (e) {
      const msg = e?.message || '';
      if (e?.status === 400 || msg.toLowerCase().includes('check')) {
        showToast('⚠️ Bệnh nhân chưa check-in tại quầy.');
      } else {
        showToast('Lỗi: ' + (msg || 'Không thể cập nhật'));
      }
    } finally {
      setUpdating(false);
    }
  };

  // Bác sĩ hoàn tất (không kê đơn): IN_PROGRESS → COMPLETED
  // Xóa phiếu khỏi local list sau khi hoàn tất
  const handleComplete = async (appt) => {
    setUpdating(true);
    try {
      await doctorUpdateAppointmentStatus(appt.appointmentId, 'COMPLETED');
      setLocalList(prev => {
        const base = prev ?? upcoming;
        return base.filter(a => a.appointmentId !== appt.appointmentId);
      });
      setSelected(null);
      showToast('✅ Đã hoàn tất khám.');
    } catch (e) {
      showToast('Lỗi: ' + (e?.message || 'Không thể cập nhật'));
    } finally {
      setUpdating(false);
    }
  };

  const statCards = [
    { icon: '👥', label: 'Cần khám', value: displayList.filter(a => ['CHECK_IN', 'IN_PROGRESS'].includes(a.status)).length || displayList.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: '✅', label: 'Đã khám tuần này',    value: stats?.totalExaminedThisWeek  ?? '—', color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: '⏳', label: 'Đang chờ check-in',   value: stats?.totalPendingAppointments ?? '—', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: '📋', label: 'Đã khám tháng này',  value: stats?.totalExaminedThisMonth ?? '—', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const loading = loadingUpcoming || loadingStats;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

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
        {/* Danh sách bệnh nhân */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Hàng chờ khám</h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">{displayList.length}</span>
          </div>
          {upcomingError && (
            <p className="px-5 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">{upcomingError}</p>
          )}
          {loadingUpcoming ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">Không có bệnh nhân chờ khám</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayList.map(p => {
                const st = STATUS_STYLE[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-500' };
                const isCheckIn    = p.status === 'CHECK_IN';
                const isInProgress = p.status === 'IN_PROGRESS';
                return (
                  <button key={p.appointmentId} onClick={() => setSelected(p)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left
                      ${selected?.appointmentId === p.appointmentId ? 'bg-blue-50' : ''}
                      ${isCheckIn ? 'border-l-4 border-cyan-400' : isInProgress ? 'border-l-4 border-green-400' : ''}`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {p.patientName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{p.patientName}</p>
                      <p className="text-xs text-gray-400 truncate">{p.symptoms || '—'}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-xs font-bold text-gray-600">{formatTime(p.startTime)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail + Actions */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{selected.patientName}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  ['Giờ hẹn',    formatTime(selected.startTime)],
                  ['Ngày',       formatDate(selected.workDate)],
                  ['Triệu chứng',selected.symptoms],
                ].filter(([,v]) => v).map(([l,v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>

              {/* Status badge */}
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLE[selected.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                {STATUS_STYLE[selected.status]?.label || selected.status}
              </span>

              {/* Bắt đầu khám — khi bệnh nhân CHECK_IN */}
              {selected.status === 'CHECK_IN' && (
                <button disabled={updating} onClick={() => handleStartExam(selected)}
                  className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60">
                  {updating ? 'Đang xử lý...' : '▶ Bắt đầu khám'}
                </button>
              )}

              {/* Hoàn tất + Tạo bệnh án — khi IN_PROGRESS */}
              {selected.status === 'IN_PROGRESS' && (
                <>
                  <Link to="/dashboard/prescription" state={{ appointmentId: selected.appointmentId }}
                    className="block text-center bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-700">
                    📋 Kê đơn / Tạo bệnh án
                  </Link>
                  <button disabled={updating} onClick={() => handleComplete(selected)}
                    className="w-full border border-gray-200 text-gray-600 text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-60">
                    {updating ? 'Đang xử lý...' : '✓ Hoàn tất khám (không kê đơn)'}
                  </button>
                </>
              )}

              {/* Tạo bệnh án cho mọi trạng thái active */}
              {!['IN_PROGRESS'].includes(selected.status) && (
                <Link to="/dashboard/prescription" state={{ appointmentId: selected.appointmentId }}
                  className="block text-center border border-green-200 text-green-700 text-sm font-bold py-2.5 rounded-xl hover:bg-green-50">
                  📋 Xem / Tạo bệnh án
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm">Chọn bệnh nhân để bắt đầu khám</p>
              <p className="text-xs mt-2 text-cyan-600">🔔 Bệnh nhân có border xanh = đã vào phòng chờ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

