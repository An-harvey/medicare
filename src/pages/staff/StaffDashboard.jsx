/**
 * StaffDashboard — Tổng quan lễ tân
 * ────────────────────────────────────
 * Role : STAFF
 * Luồng đúng theo lo_trinh.txt:
 *   STAFF chỉ làm: PENDING/CONFIRMED → CHECK_IN (check-in tại quầy)
 *   BÁC SĨ làm:   CHECK_IN → IN_PROGRESS (bắt đầu khám)
 *   Staff KHÔNG được chuyển sang IN_PROGRESS
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffAppointments } from '../../hooks/useAppointments';
import { formatTime, todayISO } from '../../utils/formatters';

// ── Map BE status → hiển thị ──
const STATUS = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700' },
  CHECK_IN:    { label: '✅ Đã check-in', cls: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: '⚕️ Đang khám',  cls: 'bg-green-100 text-green-700' },
  COMPLETED:   { label: 'Hoàn tất',      cls: 'bg-purple-100 text-purple-700' },
  CANCELLED:   { label: 'Đã hủy',        cls: 'bg-red-100 text-red-500' },
};

export default function StaffDashboard() {
  const [search, setSearch] = useState('');
  const today = todayISO();

  // ── STAFF: lấy lịch hẹn hôm nay từ API ──
  const { data: appointments, loading, error, updateStatus } = useStaffAppointments({ date: today });

  // ── Check-in: PENDING/CONFIRMED → CHECK_IN ──
  // Staff CHỈ làm check-in. Bác sĩ sẽ chuyển CHECK_IN → IN_PROGRESS
  const handleCheckin = async (appointmentId) => {
    try {
      await updateStatus(appointmentId, 'CHECK_IN');
    } catch (e) {
      console.error('Lỗi check-in:', e);
    }
  };

  // ── Filter theo tìm kiếm ──
  const filtered = appointments.filter(p =>
    !search ||
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.appointmentId?.toString().toLowerCase().includes(search.toLowerCase())
  );

  // ── Thống kê từ data thực — đúng enum BE ──
  const stats = [
    { icon: '✅', label: 'Đã check-in',  value: appointments.filter(p => ['CHECK_IN','IN_PROGRESS','COMPLETED'].includes(p.status)).length, color: 'text-cyan-600',   bg: 'bg-cyan-50' },
    { icon: '⏳', label: 'Đang chờ',     value: appointments.filter(p => ['PENDING','CONFIRMED'].includes(p.status)).length,                color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: '🏥', label: 'Đang khám',    value: appointments.filter(p => p.status === 'IN_PROGRESS').length,                               color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: '📋', label: 'Tổng hôm nay', value: appointments.length,                                                                       color: 'text-gray-600',   bg: 'bg-gray-100' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý lễ tân</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hôm nay có <strong className="text-purple-600">{appointments.length} bệnh nhân</strong> đặt lịch
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/checkin"
            className="bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors"
          >
            🔍 Tìm kiếm CCCD
          </Link>
          <Link
            to="/dashboard/book-patient"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Đặt lịch nhanh
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          ⚠️ {error} — Đang hiển thị dữ liệu cục bộ.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hàng chờ hôm nay */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Hàng chờ hôm nay</h2>
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">
              {filtered.length} người
            </span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm theo tên bệnh nhân..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
          />
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">Không có lịch hẹn nào hôm nay</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filtered.map((p, idx) => {
              const st = STATUS[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-500' };
              const canCheckin = p.status === 'PENDING';
              const canCallIn  = p.status === 'CHECK_IN';

              return (
                <div key={p.appointmentId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* STT */}
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center font-extrabold text-purple-700 text-sm shrink-0">
                    #{String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{p.patientName}</p>
                    <p className="text-xs text-gray-400">
                      {formatTime(p.startTime)} · {p.doctorName}
                    </p>
                    {p.symptoms && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{p.symptoms}</p>
                    )}
                  </div>

                  {/* Status + Actions — Staff CHỈ check-in */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${st.cls}`}>
                      {st.label}
                    </span>
                    {/* Nút check-in: PENDING hoặc CONFIRMED → CHECK_IN */}
                    {['PENDING','CONFIRMED'].includes(p.status) && (
                      <button
                        onClick={() => handleCheckin(p.appointmentId)}
                        className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                    {/* CHECK_IN: chờ bác sĩ gọi vào — staff không làm gì thêm */}
                    {p.status === 'CHECK_IN' && (
                      <span className="text-[10px] text-cyan-600 font-medium">Chờ bác sĩ</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Thao tác nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/dashboard/checkin"
          className="bg-purple-50 border border-purple-200 rounded-2xl p-5 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">🔍</div>
          <p className="font-bold text-purple-700 text-sm">Tìm theo CCCD</p>
          <p className="text-xs text-gray-400 mt-1">Tìm kiếm lịch hẹn bệnh nhân</p>
        </Link>
        <Link
          to="/dashboard/book-patient"
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-3xl mb-2">📅</div>
          <p className="font-bold text-blue-700 text-sm">Đặt lịch tại quầy</p>
          <p className="text-xs text-gray-400 mt-1">Tạo lịch hẹn cho bệnh nhân</p>
        </Link>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-bold text-gray-700 text-sm">Tổng kết hôm nay</p>
          <p className="text-xs text-gray-400 mt-1">
            Hoàn tất: <strong>{appointments.filter(p => p.status === 'COMPLETED').length}</strong> · 
            Hủy: <strong>{appointments.filter(p => p.status === 'CANCELLED').length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
