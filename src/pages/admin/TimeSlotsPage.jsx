/**
 * TimeSlotsPage — Quản lý khung giờ khám
 * ─────────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET  /api/admin/time-slots  → TimeSlotResponseDTO[] [{id, startTime, status}]
 *   POST /api/admin/time-slots
 *        Body: { startTime: "HH:mm:ss", status: true }
 *
 * Lưu ý: startTime gửi dạng "HH:mm:ss", hiển thị dạng "HH:mm"
 */
import { useState, useEffect, useCallback } from 'react';
import { adminGetTimeSlots, adminCreateTimeSlot } from '../../api/admin';

export default function TimeSlotsPage() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // ── ADMIN: load time slots ──
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetTimeSlots();
      setSlots(Array.isArray(res) ? res : []);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Format "HH:mm:ss" → "HH:mm"
  const fmt = t => t ? String(t).substring(0, 5) : '---';

  return (
    <div className="p-4 md:p-6 space-y-5">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map(s => (
            <div key={s.id}
              className={`rounded-2xl p-4 text-center border-2 ${s.status ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <p className="text-xl font-extrabold text-gray-800">{fmt(s.startTime)}</p>
              <p className="text-[10px] text-gray-400 mt-1">ID: {s.id}</p>
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.status ? '● Hoạt động' : '○ Tạm dừng'}
              </span>
            </div>
          ))}
          {slots.length === 0 && (
            <div className="col-span-6 text-center py-12 text-gray-400">Chưa có khung giờ nào</div>
          )}
        </div>
      )}

      {showAdd && (
        <AddTimeSlotModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchList(); }} />
      )}
    </div>
  );
}

function AddTimeSlotModal({ onClose, onCreated }) {
  const [time,    setTime]    = useState('08:00'); // input type=time → "HH:mm"
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!time) { setError('Vui lòng chọn giờ.'); return; }
    setLoading(true);
    try {
      // BE cần "HH:mm:ss" — thêm ":00"
      await adminCreateTimeSlot({ startTime: `${time}:00`, status: true });
      onCreated();
    } catch (err) {
      setError(err.message || 'Thêm khung giờ thất bại.');
    } finally {
      setLoading(false);
    }
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
