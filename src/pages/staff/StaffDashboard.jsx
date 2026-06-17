/**
 * StaffDashboard — Tổng quan lễ tân
 * ────────────────────────────────────────────────────────
 * Role : STAFF
 * Luồng (lo_trinh.txt §5, §10):
 *   PENDING  → [Xác nhận]  → CONFIRMED
 *   CONFIRMED → [Check-in] → CHECK_IN
 *   CHECK_IN → (Bác sĩ xử lý) → IN_PROGRESS → COMPLETED
 *
 * APIs:
 *   GET /staff/appointments/pending  → PENDING toàn hệ thống (tab "Cần xác nhận")
 *   GET /staff/appointments?date=    → hôm nay theo ngày (tab "Hôm nay")
 *   PUT /staff/appointments/{id}/status?status=CONFIRMED | CHECK_IN | CANCELLED
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffAppointments, useStaffPendingAppointments } from '../../hooks/useAppointments';
import { getStaffStatusMeta, staffActionToast } from '../../utils/staffAppointment';
import { formatTime, formatDate, todayISO } from '../../utils/formatters';

const TABS = [
  { key: 'pending', label: '⏳ Cần xác nhận' },
  { key: 'today',   label: '📅 Hôm nay' },
];

export default function StaffDashboard() {
  const [tab,           setTab]           = useState('pending');
  const [search,        setSearch]        = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast,         setToast]         = useState('');
  const today = todayISO();

  // ── Tab "Cần xác nhận": tất cả PENDING toàn hệ thống ──
  const { data: pendingList, loading: loadingPending, error: errorPending, refetch: refetchPending } =
    useStaffPendingAppointments();

  // ── Tab "Hôm nay": lịch theo ngày ──
  const { data: todayList, loading: loadingToday, error: errorToday, updateStatus } =
    useStaffAppointments({ date: today });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAction = async (appt, nextStatus) => {
    setActionLoading(appt.appointmentId);
    try {
      await updateStatus(appt.appointmentId, nextStatus);
      if (nextStatus === 'CONFIRMED') refetchPending(); // refresh pending tab
      showToast(staffActionToast(nextStatus));
    } catch (e) {
      showToast('Lỗi: ' + (e?.message || 'Không thể cập nhật'));
    } finally {
      setActionLoading(null);
    }
  };

  // Dữ liệu hiển thị theo tab
  const activeList = tab === 'pending' ? pendingList : todayList;
  const isLoading  = tab === 'pending' ? loadingPending : loadingToday;
  const activeError = tab === 'pending' ? errorPending : errorToday;

  const filtered = activeList.filter(p =>
    !search ||
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats từ data hôm nay
  const stats = [
    { icon: '⏳', label: 'Chờ xác nhận',  value: pendingList.length,                                                           color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: '📋', label: 'Đã xác nhận',   value: todayList.filter(p => p.status === 'CONFIRMED').length,                      color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: '✅', label: 'Đã check-in',   value: todayList.filter(p => ['CHECK_IN','IN_PROGRESS','COMPLETED'].includes(p.status)).length, color: 'text-cyan-600',   bg: 'bg-cyan-50' },
    { icon: '📊', label: 'Tổng hôm nay',  value: todayList.length,                                                             color: 'text-gray-600',   bg: 'bg-gray-100' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý lễ tân</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Luồng: <strong className="text-blue-600">Xác nhận</strong> → <strong className="text-purple-600">Check-in</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/checkin" className="bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-700">
            🔍 Tra cứu CCCD
          </Link>          <Link to="/dashboard/book-patient" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700">
            + Đặt lịch nhanh
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                tab === t.key ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.key === 'pending' && pendingList.length > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-50">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm theo tên bệnh nhân hoặc bác sĩ..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
          />
        </div>

        {/* Error */}
        {activeError && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-sm text-amber-700">
            ⚠️ {activeError}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">
              {tab === 'pending' ? 'Không có lịch hẹn chờ xác nhận' : 'Không có lịch hẹn nào hôm nay'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filtered.map((p, idx) => {
              const st = getStaffStatusMeta(p.status);
              const isActioning = actionLoading === p.appointmentId;
              return (
                <div key={p.appointmentId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center font-extrabold text-purple-700 text-sm shrink-0">
                    #{String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{p.patientName}</p>
                    <p className="text-xs text-gray-400">
                      {p.doctorName}
                      {p.workDate && ` · ${formatDate(p.workDate)}`}
                      {p.startTime && ` · ${formatTime(p.startTime)}`}
                    </p>
                    {p.symptoms && <p className="text-xs text-gray-400 truncate">{p.symptoms}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {st.action && (
                      <button
                        disabled={isActioning}
                        onClick={() => handleAction(p, st.nextStatus)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${st.actionCls || 'bg-blue-600 text-white'}`}
                      >
                        {isActioning ? '...' : st.action}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/dashboard/checkin" className="bg-purple-50 border border-purple-200 rounded-2xl p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">🔍</div>
          <p className="font-bold text-purple-700 text-sm">Tra cứu & Quản lý</p>
          <p className="text-xs text-gray-400 mt-1">Tìm kiếm, xác nhận, check-in</p>
        </Link>
        <Link to="/dashboard/book-patient" className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="font-bold text-blue-700 text-sm">Đặt lịch tại quầy</p>
          <p className="text-xs text-gray-400 mt-1">Tạo lịch → tự động CONFIRMED</p>
        </Link>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-bold text-gray-700 text-sm">Tổng kết hôm nay</p>
          <p className="text-xs text-gray-400 mt-1">
            Hoàn tất: <strong>{todayList.filter(p => p.status === 'COMPLETED').length}</strong> ·
            Hủy: <strong>{todayList.filter(p => p.status === 'CANCELLED').length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
