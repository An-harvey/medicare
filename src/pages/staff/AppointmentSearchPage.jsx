/**
 * CheckInPage — Quản lý check-in bệnh nhân
 * ─────────────────────────────────────────
 * Role : STAFF
 * BE enum: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 *
 * Luồng staff (lo_trinh.txt §10):
 *   Lần 1: PENDING  → CONFIRMED  (Xác nhận)
 *   Lần 2: CONFIRMED → CHECK_IN  (Check-in)
 * Bác sĩ: CHECK_IN → IN_PROGRESS → COMPLETED
 */
import { useState } from 'react';
import { useStaffAppointments } from '../../hooks/useAppointments';
import {
  getStaffStatusMeta,
  staffActionToast,
  canStaffCancel,
} from '../../utils/staffAppointment';
import { formatTime } from '../../utils/formatters';

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
      showToast(staffActionToast(nextStatus));
    } catch (e) {
      showToast('Lỗi: ' + (e?.message || 'Không thể cập nhật trạng thái'));
    } finally { setActionLoading(null); }
  };

  // ── Hủy lịch (staff) ──
  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      await updateStatus(selected.appointmentId, 'CANCELLED');
      setCancelModal(false);
      setCancelReason('');
      setSelected(null);
      showToast('Đã hủy lịch hẹn.');
      refetch();
    } catch (e) {
      showToast('Lỗi hủy: ' + (e?.message || 'Thất bại'));
    } finally { setCancelling(false); }
  };

  const getStatus = getStaffStatusMeta;

  const stats = [
    { icon: '⏳', label: 'Chờ xác nhận', value: queue.filter(p => p.status === 'PENDING').length, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { icon: '📋', label: 'Đã xác nhận',  value: queue.filter(p => p.status === 'CONFIRMED').length, color: 'text-blue-700', bg: 'bg-blue-50' },
    { icon: '✅', label: 'Đã check-in',  value: queue.filter(p => ['CHECK_IN','IN_PROGRESS','COMPLETED'].includes(p.status)).length, color: 'text-cyan-700', bg: 'bg-cyan-50' },
    { icon: '📊', label: 'Tổng',         value: queue.length, color: 'text-gray-700', bg: 'bg-gray-100' },
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
          <p className="text-sm text-gray-500 mt-0.5">
            {TODAY} · Bước 1: <strong className="text-blue-600">Xác nhận</strong> → Bước 2: <strong className="text-purple-600">Check-in</strong>
          </p>
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
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>❌</span>
          <div>
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-xs mt-0.5">{error}</p>
            <p className="text-xs text-red-500 mt-0.5">Kiểm tra BE đang chạy và bạn đã đăng nhập đúng role STAFF</p>
          </div>
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
              <p className="text-sm font-medium">Không có lịch hẹn nào</p>
              <p className="text-xs mt-1">
                {cccdSearch ? `Không tìm thấy lịch hẹn với CCCD "${cccdSearch}"` : `Hôm nay (${TODAY}) chưa có lịch hẹn`}
              </p>
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
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${st.actionCls || 'bg-purple-600 text-white'}`}>
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
          const canCancel = canStaffCancel(selected.status);
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
                  className={`w-full text-xs font-bold py-2.5 rounded-xl disabled:opacity-60 ${st.actionCls || 'bg-purple-600 text-white hover:bg-purple-700'}`}>
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

