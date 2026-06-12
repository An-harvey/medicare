/**
 * TimeSlotsPage — Quản lý khung giờ khám
 * ─────────────────────────────────────────
 * Role: ADMIN
 * API:
 *   GET    /admin/time-slots         → TimeSlotResponseDTO[] [{id, startTime, status}]
 *   POST   /admin/time-slots         → TimeSlot (201)
 *   DELETE /admin/time-slots/{id}    → 204  ← BE cần bổ sung
 *
 * startTime: gửi "HH:mm:ss", hiển thị "HH:mm"
 */
import { useState, useEffect, useCallback } from 'react';
import { adminGetTimeSlots, adminCreateTimeSlot, adminDeleteTimeSlot } from '../../api/admin';

// Parse "HH:mm:ss" hoặc array → "HH:mm"
function fmt(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

export default function TimeSlotsPage() {
  const [slots,    setSlots]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const [deleting, setDeleting] = useState(null);

  // ── Load khung giờ ──
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetTimeSlots();
      setSlots(Array.isArray(res) ? res : []);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Xóa khung giờ ──
  const handleDelete = async (slot) => {
    if (!window.confirm(`Xóa khung giờ ${fmt(slot.startTime)}?`)) return;
    setDeleting(slot.id);
    try {
      await adminDeleteTimeSlot(slot.id);
      await fetchList();
    } catch (err) {
      alert(err.message || 'Không thể xóa. BE có thể chưa hỗ trợ endpoint này.');
    } finally { setDeleting(null); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Khung giờ khám</h1>
          <p className="text-sm text-gray-400 mt-0.5">{slots.length} khung giờ trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          + Thêm khung giờ
        </button>
      </div>

      {/* Grid khung giờ */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map(s => (
            <div key={s.id}
              className={`rounded-2xl p-4 border-2 flex flex-col items-center gap-2 relative group
                ${s.status ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {/* Giờ */}
              <p className="text-2xl font-extrabold text-gray-800">{fmt(s.startTime)}</p>
              {/* Badge trạng thái */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                s.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {s.status ? '● Hoạt động' : '○ Tạm dừng'}
              </span>
              <p className="text-[10px] text-gray-400">ID: {s.id}</p>

              {/* Nút xóa — hiện khi hover */}
              <button
                onClick={() => handleDelete(s)}
                disabled={deleting === s.id}
                className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full
                  flex items-center justify-center text-[10px] font-bold
                  opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 disabled:opacity-50"
                title="Xóa khung giờ"
              >
                {deleting === s.id ? '...' : '✕'}
              </button>
            </div>
          ))}
          {slots.length === 0 && !loading && (
            <div className="col-span-6 text-center py-12 text-gray-400">
              Chưa có khung giờ nào
            </div>
          )}
        </div>
      )}

      {/* Modal thêm khung giờ */}
      {showAdd && (
        <AddTimeSlotModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetchList(); }}
        />
      )}
    </div>
  );
}

function AddTimeSlotModal({ onClose, onCreated }) {
  const [time,    setTime]    = useState('08:00');
  const [active,  setActive]  = useState(true);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!time) { setError('Vui lòng chọn giờ.'); return; }
    setLoading(true);
    try {
      // startTime gửi dạng "HH:mm:ss"
      await adminCreateTimeSlot({ startTime: `${time}:00`, status: active });
      onCreated();
    } catch (err) {
      setError(err.message || 'Thêm khung giờ thất bại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Thêm khung giờ mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giờ bắt đầu *</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Trạng thái hoạt động</span>
            <button type="button" onClick={() => setActive(!active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang thêm...' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
