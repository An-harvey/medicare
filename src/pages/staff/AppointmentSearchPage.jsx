/**
 * CheckInPage — Quản lý check-in bệnh nhân
 * ─────────────────────────────────────────
 * Role : STAFF
 * BE enum: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 *
 * Luồng:
 *   PENDING → (Check-in) → CHECK_IN → (Gọi vào) → IN_PROGRESS → COMPLETED
 */
import { useState } from 'react';
import { useStaffAppointments } from '../../hooks/useAppointments';
import { staffCancelAppointment } from '../../api/staff';

function formatTime(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

// ── Map BE status → label + style + action ──
// STAFF chỉ làm PENDING/CONFIRMED → CHECK_IN
// BÁC SĨ làm CHECK_IN → IN_PROGRESS (không phải staff)
const STATUS = {
  PENDING:     { label:'Chờ xác nhận', cls:'bg-yellow-100 text-yellow-700', dot:'bg-yellow-500', action:'Check-in',  nextStatus:'CHECK_IN' },
  CONFIRMED:   { label:'Đã xác nhận',  cls:'bg-blue-100 text-blue-700',    dot:'bg-blue-500',   action:'Check-in',  nextStatus:'CHECK_IN' },
  CHECK_IN:    { label:'✅ Đã check-in',cls:'bg-cyan-100 text-cyan-700',    dot:'bg-cyan-500',   action:null,        nextStatus:null },
  IN_PROGRESS: { label:'⚕️ Đang khám', cls:'bg-green-100 text-green-700',  dot:'bg-green-500',  action:null,        nextStatus:null },
  COMPLETED:   { label:'Đã khám',      cls:'bg-gray-100 text-gray-400',    dot:'bg-gray-300',   action:null,        nextStatus:null },
  CANCELLED:   { label:'Đã hủy',       cls:'bg-red-100 text-red-500',      dot:'bg-red-400',    action:null,        nextStatus:null },
};

const TODAY = new Date().toISOString().split('T')[0];

export default function CheckInPage() {
  const [cccdSearch,    setCccdSearch]    = useState('');
  const [searchKey,     setSearchKey]     = useState({ date: TODAY });
  const [selected,      setSelected]      = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelModal,   setCancelModal]   = useState(false);
  const [cancelReason,  setCancelReason]  = useState('');
  const [cancelling,    setCancelling]    = useState(false);
  const [toast,         setToast]         = useState('');

  const { data: queue, loading, error, refetch, updateStatus } = useStaffAppointments(searchKey);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Tìm theo CCCD ──
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKey(cccdSearch.trim() ? { cccd: cccdSearch.trim() } : { date: TODAY });
    setSelected(null);
  };

  // ── Check-in / Gọi vào ──
  const handleAction = async (appt, nextStatus) => {
    setActionLoading(appt.appointmentId);
    try {
      await updateStatus(appt.appointmentId, nextStatus);
      setSelected(prev => prev?.appointmentId === appt.appointmentId
        ? { ...prev, status: nextStatus } : prev);
      showToast(nextStatus === 'CHECK_IN' ? '✅ Check-in thành công!' : 'Đã cập nhật trạng thái.');
    } catch (e) {
      showToast('Lỗi: ' + (e?.message || 'Không thể cập nhật trạng thái'));
    } finally { setActionLoading(null); }
  };

  // ── Hủy lịch (staff) ──
  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      await staffCancelAppointment(selected.appointmentId, cancelReason.trim() || 'Lễ tân hủy lịch');
      setCancelModal(false);
      setCancelReason('');
      setSelected(null);
      showToast('Đã hủy lịch hẹn.');
      refetch();
    } catch (e) {
      showToast('Lỗi hủy: ' + (e?.message || 'Thất bại'));
    } finally { setCancelling(false); }
  };

  const getStatus = (s) => STATUS[s] || { label: s, cls:'bg-gray-100 text-gray-500', dot:'bg-gray-400', action:null };

  const stats = [
    { label:'Tổng',        value: queue.length,                                                    color:'text-gray-700',  bg:'bg-gray-100' },
    { label:'Đã check-in', value: queue.filter(p => ['CHECK_IN','IN_PROGRESS','COMPLETED'].includes(p.status)).length, color:'text-cyan-700',   bg:'bg-cyan-50' },
    { label:'Đang khám',   value: queue.filter(p => p.status === 'IN_PROGRESS').length,            color:'text-green-700', bg:'bg-green-50' },
    { label:'Chờ đến',     value: queue.filter(p => ['PENDING','CONFIRMED'].includes(p.status)).length, color:'text-yellow-700', bg:'bg-yellow-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Check-in bệnh nhân</h1>
          <p className="text-sm text-gray-400 mt-0.5">{TODAY}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={cccdSearch} onChange={e => setCccdSearch(e.target.value)}
            placeholder="Tra cứu theo CCCD (bỏ trống = hôm nay)..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm" />
        </div>
        <button type="submit" className="bg-purple-600 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-purple-700">Tìm</button>
        {cccdSearch && (
          <button type="button" onClick={() => { setCccdSearch(''); setSearchKey({ date: TODAY }); }}
            className="border border-gray-200 text-gray-500 text-sm px-4 py-3 rounded-xl hover:bg-gray-50">✕</button>
        )}
      </form>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Danh sách */}
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
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {queue.map((appt, i) => {
                const st = getStatus(appt.status);
                const isActioning = actionLoading === appt.appointmentId;
                return (
                  <div key={appt.appointmentId}
                    onClick={() => setSelected(appt)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors
                      ${selected?.appointmentId === appt.appointmentId ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-extrabold text-sm shrink-0">
                      {String(i + 1).padStart(2,'0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{appt.patientName}</p>
                      <p className="text-[10px] text-gray-400">{appt.doctorName} · {formatTime(appt.startTime)}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                      {st.label}
                    </span>
                    {st.action && (
                      <button disabled={isActioning}
                        onClick={e => { e.stopPropagation(); handleAction(appt, st.nextStatus); }}
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60
                          ${st.nextStatus === 'CHECK_IN'    ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            st.nextStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}>
                        {isActioning ? '...' : st.action}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chi tiết */}
        {selected ? (() => {
          const st = getStatus(selected.status);
          const canCancel = ['PENDING','CONFIRMED'].includes(selected.status);
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Chi tiết</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-2">
                {[
                  ['Bệnh nhân',   selected.patientName],
                  ['Bác sĩ',      selected.doctorName],
                  ['Giờ hẹn',     formatTime(selected.startTime)],
                  ['Triệu chứng', selected.symptoms],
                  ['Lý do hủy',   selected.cancelReason],
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

              {/* Action chính */}
              {st.action && (
                <button disabled={actionLoading === selected.appointmentId}
                  onClick={() => handleAction(selected, st.nextStatus)}
                  className="w-full bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purple-700 disabled:opacity-60">
                  {actionLoading === selected.appointmentId ? 'Đang xử lý...' : st.action}
                </button>
              )}

              {/* Hủy lịch — chỉ khi chưa check-in */}
              {canCancel && (
                <button onClick={() => { setCancelReason(''); setCancelModal(true); }}
                  className="w-full border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50">
                  🚫 Hủy lịch hẹn
                </button>
              )}

              <button className="w-full border border-gray-200 text-gray-500 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50">
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

      {/* Modal hủy lịch */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full z-10">
            <h3 className="font-bold text-gray-800 mb-1">Hủy lịch hẹn</h3>
            <p className="text-sm text-gray-500 mb-4">
              Bệnh nhân: <strong>{selected?.patientName}</strong>
            </p>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lý do hủy</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              rows={3} placeholder="Bệnh nhân bận, xin hủy lịch..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm">
                Đóng
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700 disabled:opacity-60">
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

