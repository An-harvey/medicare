/**
 * CheckInPage — Quản lý check-in bệnh nhân
 * ─────────────────────────────────────────
 * Role : STAFF
 * API  :
 *   GET /api/staff/appointments?date=yyyy-MM-dd → List<AppointmentResponseDTO>
 *   GET /api/staff/appointments?cccd=           → List<AppointmentResponseDTO> (tra cứu)
 *   PUT /api/staff/appointments/{id}/status?status=ARRIVED     → check-in
 *   PUT /api/staff/appointments/{id}/status?status=IN_PROGRESS → gọi vào khám
 *
 * AppointmentResponseDTO:
 *   { appointmentId, patientName, doctorName, workDate, startTime, symptoms, status, cancelReason }
 *
 * AppointmentStatus: PENDING | ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
 */
import { useState } from 'react';
import { useStaffAppointments } from '../../hooks/useAppointments';

// ── Format LocalTime từ BE ──
function formatTime(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

// ── Map trạng thái lịch hẹn ──
const STATUS = {
  PENDING:     { label:'Chưa đến',    cls:'bg-gray-100 text-gray-500',    dot:'bg-gray-400',   action:'Check-in',  nextStatus:'ARRIVED' },
  ARRIVED:     { label:'Đã check-in', cls:'bg-green-100 text-green-700',  dot:'bg-green-500',  action:'Gọi vào',   nextStatus:'IN_PROGRESS' },
  IN_PROGRESS: { label:'Đang khám',   cls:'bg-blue-100 text-blue-700',    dot:'bg-blue-500',   action: null,       nextStatus: null },
  COMPLETED:   { label:'Đã khám',     cls:'bg-gray-100 text-gray-400',    dot:'bg-gray-300',   action: null,       nextStatus: null },
  CANCELLED:   { label:'Đã hủy',      cls:'bg-red-100 text-red-500',      dot:'bg-red-400',    action: null,       nextStatus: null },
  NO_SHOW:     { label:'Không đến',   cls:'bg-orange-100 text-orange-600',dot:'bg-orange-400', action: null,       nextStatus: null },
};

// ── Ngày hôm nay dạng "yyyy-MM-dd" ──
const TODAY = new Date().toISOString().split('T')[0];

export default function CheckInPage() {
  const [cccdSearch, setCccdSearch] = useState('');
  const [searchKey,  setSearchKey]  = useState({ date: TODAY }); // params gửi vào hook
  const [selected,   setSelected]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // scheduleId đang xử lý

  // ── STAFF: lấy danh sách lịch hẹn theo ngày hoặc CCCD ──
  const { data: queue, loading, error, refetch, updateStatus } = useStaffAppointments(searchKey);

  // ── Tìm kiếm theo CCCD ──
  const handleSearch = (e) => {
    e.preventDefault();
    if (cccdSearch.trim()) {
      setSearchKey({ cccd: cccdSearch.trim() });
    } else {
      setSearchKey({ date: TODAY });
    }
    setSelected(null);
  };

  // ── Xử lý action (Check-in / Gọi vào) ──
  const handleAction = async (appt, nextStatus) => {
    setActionLoading(appt.appointmentId);
    try {
      await updateStatus(appt.appointmentId, nextStatus);
      setSelected(prev => prev?.appointmentId === appt.appointmentId
        ? { ...prev, status: nextStatus } : prev);
    } catch { /* lỗi đã log trong hook */ }
    finally { setActionLoading(null); }
  };

  const getStatus = (s) => STATUS[s] || { label: s, cls:'bg-gray-100 text-gray-500', dot:'bg-gray-400', action: null };

  // ── Stats đếm theo trạng thái ──
  const stats = [
    { label:'Tổng hôm nay',  value: queue.length,                                         color:'text-gray-700',  bg:'bg-gray-100' },
    { label:'Đã check-in',   value: queue.filter(p => p.status === 'ARRIVED').length,     color:'text-green-700', bg:'bg-green-100' },
    { label:'Đang khám',     value: queue.filter(p => p.status === 'IN_PROGRESS').length, color:'text-blue-700',  bg:'bg-blue-100' },
    { label:'Chưa đến',      value: queue.filter(p => p.status === 'PENDING').length,     color:'text-gray-500',  bg:'bg-gray-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Check-in bệnh nhân</h1>
          <p className="text-sm text-gray-400 mt-0.5">{TODAY}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── STAFF: tìm kiếm theo CCCD ── */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={cccdSearch} onChange={e => setCccdSearch(e.target.value)}
            placeholder="Tra cứu theo CCCD bệnh nhân (bỏ trống = xem hôm nay)..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm" />
        </div>
        <button type="submit"
          className="bg-purple-600 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-purple-700 transition-colors">
          Tìm
        </button>
        {cccdSearch && (
          <button type="button" onClick={() => { setCccdSearch(''); setSearchKey({ date: TODAY }); }}
            className="border border-gray-200 text-gray-500 text-sm px-4 py-3 rounded-xl hover:bg-gray-50">
            ✕
          </button>
        )}
      </form>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
          ⚠️ Không thể kết nối server, hiển thị dữ liệu mẫu.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Hàng chờ ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Danh sách bệnh nhân</p>
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">{queue.length} người</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : queue.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {queue.map((appt, i) => {
                const st = getStatus(appt.status);
                const isActioning = actionLoading === appt.appointmentId;
                return (
                  <div key={appt.appointmentId}
                    onClick={() => setSelected(appt)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${selected?.appointmentId === appt.appointmentId ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                    {/* Số thứ tự */}
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-extrabold text-sm shrink-0">
                      {String(i + 1).padStart(2,'0')}
                    </div>
                    {/* Tên + thông tin */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{appt.patientName}</p>
                      <p className="text-[10px] text-gray-400">{appt.doctorName} · {formatTime(appt.startTime)}</p>
                    </div>
                    {/* Status badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                      {st.label}
                    </span>
                    {/* Action button */}
                    {st.action && (
                      <button
                        disabled={isActioning}
                        onClick={e => { e.stopPropagation(); handleAction(appt, st.nextStatus); }}
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                          st.nextStatus === 'ARRIVED'     ? 'bg-purple-600 text-white hover:bg-purple-700' :
                          st.nextStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : ''
                        } disabled:opacity-60`}>
                        {isActioning ? '...' : st.action}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Chi tiết bệnh nhân ── */}
        {selected ? (() => {
          const st = getStatus(selected.status);
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Chi tiết</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Bệnh nhân', selected.patientName],
                  ['Bác sĩ',    selected.doctorName],
                  ['Giờ hẹn',   formatTime(selected.startTime)],
                  ['Triệu chứng', selected.symptoms],
                  ['Lý do hủy', selected.cancelReason],
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
              {st.action && (
                <button
                  disabled={actionLoading === selected.appointmentId}
                  onClick={() => handleAction(selected, st.nextStatus)}
                  className="w-full bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60">
                  {actionLoading === selected.appointmentId ? 'Đang xử lý...' : st.action}
                </button>
              )}
              <button className="w-full border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50">
                🖨️ In phiếu
              </button>
            </div>
          );
        })() : (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">👆</div>
            <p className="text-sm">Chọn bệnh nhân để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
