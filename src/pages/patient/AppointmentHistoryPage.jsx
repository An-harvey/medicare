/**
 * MyBookings — Lịch hẹn của tôi
 * ─────────────────────────────
 * Role   : PATIENT
 * API    : GET  /api/patient/appointments  → List<AppointmentResponseDTO>
 *          PUT  /api/patient/appointments/{id}/cancel?reason=
 *
 * AppointmentResponseDTO:
 *   { appointmentId, patientName, doctorName, workDate, startTime, symptoms, status, cancelReason }
 *
 * AppointmentStatus: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyAppointments } from '../../hooks/useAppointments';
import { createVnPayLink } from '../../api/payment';

// ── Map BE status enum → FE display — đúng theo BE enum ──
// BE: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
const STATUS_MAP = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  CHECK_IN:    { label: 'Đã check-in',  cls: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-500' },
  IN_PROGRESS: { label: 'Đang khám',    cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  COMPLETED:   { label: 'Đã khám',      cls: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
};

// ── Tabs phân loại lịch hẹn ──
const TABS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'done',     label: 'Đã khám' },
  { key: 'cancelled',label: 'Đã hủy' },
];

// Hàm format ngày từ BE (LocalDate "yyyy-MM-dd" hoặc array [y,m,d])
function formatDate(d) {
  if (!d) return '---';
  if (Array.isArray(d)) return `${String(d[2]).padStart(2,'0')}/${String(d[1]).padStart(2,'0')}/${d[0]}`;
  return String(d).split('T')[0].split('-').reverse().join('/');
}

// Hàm format giờ từ BE (LocalTime "HH:mm:ss" hoặc array [h,m,s])
function formatTime(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

export default function MyBookings() {
  const [tab,    setTab]    = useState('all');
  const [detail, setDetail] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [toast, setToast] = useState('');
  const [payingId, setPayingId] = useState(null); // appointment đang xử lý thanh toán

  // ── PATIENT: lấy danh sách lịch hẹn từ API ──
  const { data: appointments, loading, error, refetch, cancel } = useMyAppointments();

  // ── PATIENT: thanh toán VNPay ──
  const handlePayVnPay = async (appointmentId) => {
    setPayingId(appointmentId);
    try {
      const res = await createVnPayLink(appointmentId);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl; // redirect ra ngoài VNPay
      }
    } catch (e) {
      setToast('Lỗi tạo link thanh toán: ' + (e?.message || 'Thử lại sau'));
      setTimeout(() => setToast(''), 3000);
    } finally {
      setPayingId(null);
    }
  };

  // ── Filter theo tab ──
  const filtered = appointments.filter(b => {
    if (tab === 'upcoming')  return ['PENDING','CONFIRMED','CHECK_IN','IN_PROGRESS'].includes(b.status);
    if (tab === 'done')      return b.status === 'COMPLETED';
    if (tab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  // ── PATIENT: hủy lịch hẹn ──
  const handleCancel = async () => {
    if (!detail) return;
    setCancelling(true);
    setCancelError('');
    try {
      await cancel(detail.appointmentId, cancelReason.trim() || 'Bệnh nhân tự hủy');
      setShowCancelModal(false);
      setDetail(null);
      setCancelReason('');
      setToast('Đã hủy lịch hẹn thành công.');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      setCancelError(e?.message || 'Hủy lịch thất bại. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = () => {
    setCancelError('');
    setCancelReason('');
    setShowCancelModal(true);
  };

  const getStatus = (s) => STATUS_MAP[s] || { label: s, cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };

  // ── Loading state ──
  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Toast thành công */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch hẹn của tôi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý tất cả lịch khám đã đặt</p>
        </div>
        <Link to="/doctors"
          className="bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          + Đặt lịch mới
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700 flex items-center gap-2">
          <span>⚠️</span> Không thể kết nối server, hiển thị dữ liệu mẫu.
        </div>
      )}

      {/* Tabs với count */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const count = appointments.filter(b => {
            if (t.key === 'all')       return true;
            if (t.key === 'upcoming')  return ['PENDING','CONFIRMED','CHECK_IN','IN_PROGRESS'].includes(b.status);
            if (t.key === 'done')      return b.status === 'COMPLETED';
            if (t.key === 'cancelled') return b.status === 'CANCELLED';
            return false;
          }).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Danh sách lịch hẹn ── */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">Không có lịch hẹn nào</p>
              <Link to="/doctors" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Đặt lịch ngay</Link>
            </div>
          ) : filtered.map(b => {
            const st = getStatus(b.status);
            return (
              <button key={b.appointmentId} onClick={() => setDetail(b)}
                className={`w-full bg-white rounded-2xl border-2 p-4 text-left hover:shadow-md transition-all ${detail?.appointmentId === b.appointmentId ? 'border-blue-400' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">👨‍⚕️</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{b.doctorName}</p>
                      <p className="text-xs text-gray-400">{b.symptoms || 'Không có triệu chứng'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                  <span>📅 {formatDate(b.workDate)}</span>
                  <span>⏰ {formatTime(b.startTime)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Detail panel ── */}
        <div>
          {detail ? (() => {
            const st = getStatus(detail.status);
            const canCancel = ['PENDING', 'CONFIRMED'].includes(detail.status);
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Chi tiết lịch hẹn</h3>
                  <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                </div>
                <div className="space-y-2.5">
                  {[
                    ['Mã lịch',    detail.appointmentId?.toString().slice(0,8) + '...'],
                    ['Bác sĩ',     detail.doctorName],
                    ['Ngày khám',  formatDate(detail.workDate)],
                    ['Giờ khám',   formatTime(detail.startTime)],
                    ['Triệu chứng',detail.symptoms],
                  ].filter(([,v]) => v).map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-gray-50 text-xs">
                      <span className="text-gray-400">{l}</span>
                      <span className="font-semibold text-gray-700 text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${st.cls}`}>
                  <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
                  {st.label}
                </span>
                {/* Chỉ cho hủy khi PENDING hoặc CONFIRMED — chưa check-in */}
                {canCancel ? (
                  <button onClick={openCancelModal}
                    className="w-full border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                    🚫 Hủy lịch hẹn
                  </button>
                ) : ['CHECK_IN','IN_PROGRESS'].includes(detail.status) ? (
                  <p className="text-xs text-gray-400 text-center bg-gray-50 rounded-xl py-2.5">
                    Không thể hủy — bệnh nhân đã check-in
                  </p>
                ) : null}

                {/* Thanh toán VNPay — khi PENDING */}
                {detail.status === 'PENDING' && (
                  <button
                    onClick={() => handlePayVnPay(detail.appointmentId)}
                    disabled={payingId === detail.appointmentId}
                    className="w-full bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {payingId === detail.appointmentId ? (
                      <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang xử lý...</>
                    ) : '💳 Thanh toán VNPay'}
                  </button>
                )}
              </div>
            );
          })() : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm">Chọn lịch hẹn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal xác nhận hủy ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full z-10">
            <h3 className="font-bold text-gray-800 mb-1">Xác nhận hủy lịch hẹn</h3>
            <p className="text-sm text-gray-500 mb-4">
              Bác sĩ: <strong>{detail?.doctorName}</strong>
            </p>

            {/* Lỗi từ API */}
            {cancelError && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
                ⚠️ {cancelError}
              </div>
            )}

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Lý do hủy (không bắt buộc)
            </label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Bận việc đột xuất, đổi lịch..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelError(''); }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50"
              >
                Giữ lịch
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang hủy...</>
                  : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
