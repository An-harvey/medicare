/**
 * SchedulesPage — Lịch làm việc & Phân công bác sĩ (gộp 1 trang)
 * ─────────────────────────────────────────────────────────────────
 * Role: ADMIN
 * API:
 *   GET    /admin/schedules?doctorId=&workDate=&specialtyId=&page=&size=
 *          → Page<ScheduleResponseDTO>
 *          { scheduleId, doctorId, doctorName, workDate, startTime,
 *            maxPatients, currentPatients, status }
 *   POST   /admin/schedules        → ScheduleResponseDTO (201)
 *   DELETE /admin/schedules/{id}   → 204  ← BE cần bổ sung
 *
 *   GET    /public/doctors         → DoctorResponseDTO[] (chọn bác sĩ)
 *   GET    /admin/time-slots       → TimeSlotResponseDTO[] (chọn khung giờ)
 *
 * ScheduleStatus: AVAILABLE | FULL | CANCELLED
 */
import { useState, useCallback, useEffect } from 'react';
import {
  adminGetSchedules,
  adminCreateSchedule,
  adminDeleteSchedule,
  adminGetTimeSlots,
} from '../../api/admin';
import { getDoctors } from '../../api/public';
import { formatDate, formatTime, todayISO } from '../../utils/formatters';
import { SCHEDULE_STATUS } from '../../utils/constants';

export default function SchedulesPage() {
  const [schedules,   setSchedules]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(0);
  const [showCreate,  setShowCreate]  = useState(false);
  const [deleting,    setDeleting]    = useState(null);

  // ── Filters ──
  const [filterDate,    setFilterDate]    = useState('');
  const [filterDoctor,  setFilterDoctor]  = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');

  // ── Load danh sách lịch ──
  const fetchList = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = {
        page: pg, size: 10,
        sortBy: 'workDate', direction: 'DESC',
        ...(filterDate      ? { workDate:    filterDate }      : {}),
        ...(filterDoctor    ? { doctorId:    filterDoctor }    : {}),
        ...(filterSpecialty ? { specialtyId: filterSpecialty } : {}),
      };
      const res = await adminGetSchedules(params);
      setSchedules(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { setSchedules([]); }
    finally { setLoading(false); }
  }, [page, filterDate, filterDoctor, filterSpecialty]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Xóa lịch ──
  const handleDelete = async (s) => {
    if (!window.confirm(`Xóa lịch ${formatDate(s.workDate)} – ${formatTime(s.startTime)} của ${s.doctorName}?`)) return;
    setDeleting(s.scheduleId);
    try {
      await adminDeleteSchedule(s.scheduleId);
      await fetchList();
    } catch (err) {
      alert(err.message || 'Không thể xóa. BE có thể chưa hỗ trợ endpoint này.');
    } finally { setDeleting(null); }
  };

  const handleFilter = e => { e.preventDefault(); setPage(0); fetchList(0); };
  const handleClearFilter = () => { setFilterDate(''); setFilterDoctor(''); setFilterSpecialty(''); setPage(0); };

  const getStatus = (s) => SCHEDULE_STATUS[s] || { label: s, cls: 'bg-gray-100 text-gray-500' };

  // ── Đếm theo trạng thái ──
  const stats = {
    AVAILABLE: schedules.filter(s => s.status === 'AVAILABLE').length,
    FULL:      schedules.filter(s => s.status === 'FULL').length,
    CANCELLED: schedules.filter(s => s.status === 'CANCELLED').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch làm việc & Phân công</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tạo lịch làm việc và phân công bác sĩ theo ngày</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
          + Tạo lịch làm việc
        </button>
      </div>

      {/* ── Stats mini ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-green-600">{stats.AVAILABLE}</p>
          <p className="text-xs text-gray-500 mt-0.5">Còn chỗ</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-red-500">{stats.FULL}</p>
          <p className="text-xs text-gray-500 mt-0.5">Hết chỗ</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-gray-500">{stats.CANCELLED}</p>
          <p className="text-xs text-gray-500 mt-0.5">Đã hủy</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày làm việc</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
        </div>
        <div className="flex gap-2">
          <button type="submit"
            className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-700">
            Lọc
          </button>
          <button type="button" onClick={handleClearFilter}
            className="border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-xl hover:bg-gray-50">
            Xóa lọc
          </button>
        </div>
      </form>

      {/* ── Bảng lịch làm việc ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Bác sĩ</th>
              <th className="px-5 py-3 text-left">Ngày làm việc</th>
              <th className="px-5 py-3 text-left">Giờ bắt đầu</th>
              <th className="px-5 py-3 text-center">Đã đặt / Tối đa</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">
                Không có lịch làm việc nào. Nhấn "+ Tạo lịch làm việc" để bắt đầu.
              </td></tr>
            ) : schedules.map(s => {
              const st = getStatus(s.status);
              const pct = s.maxPatients > 0 ? Math.round((s.currentPatients / s.maxPatients) * 100) : 0;
              return (
                <tr key={s.scheduleId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{s.doctorName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(s.workDate)}</td>
                  <td className="px-5 py-3.5 font-bold text-blue-600">{formatTime(s.startTime)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>
                        <span className="font-semibold text-gray-700">{s.currentPatients ?? 0}</span>
                        <span className="text-gray-400">/{s.maxPatients}</span>
                      </span>
                      {/* Progress bar */}
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(s)}
                      disabled={deleting === s.scheduleId}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 text-xs transition-colors disabled:opacity-50"
                      title="Xóa lịch">
                      {deleting === s.scheduleId ? '...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {schedules.length} / {total} lịch</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => { setPage(p => p-1); fetchList(page-1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg">{page + 1}</span>
            <button disabled={schedules.length < 10} onClick={() => { setPage(p => p+1); fetchList(page+1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      </div>

      {/* ── Modal tạo lịch ── */}
      {showCreate && (
        <CreateScheduleModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchList(); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Modal tạo lịch làm việc — chọn bác sĩ + ngày + khung giờ
══════════════════════════════════════════════════════ */
function CreateScheduleModal({ onClose, onCreated }) {
  const [doctors,   setDoctors]   = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    doctorId:    '',
    workDate:    todayISO(),
    timeSlotId:  '',
    maxPatients: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Load doctors + time slots khi mở modal
  useEffect(() => {
    Promise.all([
      getDoctors().then(res => setDoctors(Array.isArray(res) ? res : [])).catch(() => {}),
      adminGetTimeSlots().then(res => setTimeSlots(Array.isArray(res) ? res : [])).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, []);

  const fmtSlot = t => t ? String(t).substring(0, 5) : '';

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.doctorId)   { setError('Vui lòng chọn bác sĩ.'); return; }
    if (!form.workDate)   { setError('Vui lòng chọn ngày.'); return; }
    if (!form.timeSlotId) { setError('Vui lòng chọn khung giờ.'); return; }
    setLoading(true);
    setError('');
    try {
      await adminCreateSchedule({
        doctorId:    form.doctorId,
        workDate:    form.workDate,
        timeSlotId:  Number(form.timeSlotId),
        maxPatients: Number(form.maxPatients),
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Tạo lịch thất bại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-gray-800">Tạo lịch làm việc</h3>
            <p className="text-xs text-gray-400 mt-0.5">Phân công bác sĩ theo ngày và khung giờ</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span>⚠️</span>{error}
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Bác sĩ */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bác sĩ *</label>
              <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50">
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.specialtyName ? `(${d.specialtyName})` : ''}
                  </option>
                ))}
              </select>
              {doctors.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">⚠️ Chưa có bác sĩ. Tạo tài khoản Doctor trước.</p>
              )}
            </div>

            {/* Ngày làm việc */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày làm việc *</label>
              <input type="date" value={form.workDate}
                onChange={e => setForm(f => ({ ...f, workDate: e.target.value }))}
                min={todayISO()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
            </div>

            {/* Khung giờ */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khung giờ *</label>
              {timeSlots.length === 0 ? (
                <p className="text-xs text-yellow-600">⚠️ Chưa có khung giờ. Tạo khung giờ trước ở mục "Khung giờ".</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {timeSlots.filter(t => t.status !== false).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, timeSlotId: String(t.id) }))}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.timeSlotId === String(t.id)
                          ? 'border-slate-700 bg-slate-800 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-slate-400'
                      }`}>
                      {fmtSlot(t.startTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Số bệnh nhân tối đa */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số bệnh nhân tối đa</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="1" max="50" value={form.maxPatients}
                  onChange={e => setForm(f => ({ ...f, maxPatients: e.target.value }))}
                  className="flex-1 accent-slate-800" />
                <span className="w-10 text-center font-bold text-gray-800">{form.maxPatients}</span>
              </div>
            </div>

            {/* Nút */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Đang tạo...' : 'Tạo lịch'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
