/**
 * SchedulesPage — Quản lý lịch làm việc bác sĩ
 * ──────────────────────────────────────────────
 * Role  : ADMIN
 * API   :
 *   GET  /api/admin/schedules?doctorId=&workDate=&specialtyId=&page=&size=
 *        → Page<ScheduleResponseDTO>
 *        { scheduleId, doctorId, doctorName, workDate, startTime,
 *          maxPatients, currentPatients, status }
 *
 *   POST /api/admin/schedules
 *        Body: { doctorId, workDate, timeSlotId, maxPatients }
 *        → ScheduleResponseDTO (201)
 *
 *   GET  /api/public/doctors  → DoctorResponseDTO[] (chọn bác sĩ khi tạo)
 *   GET  /api/admin/time-slots → TimeSlotResponseDTO[] (chọn time slot)
 */
import { useState, useCallback } from 'react';
import { adminGetSchedules, adminCreateSchedule, adminGetTimeSlots } from '../../api/admin';
import { getDoctors } from '../../api/public';
import { formatDate, formatTime, todayISO } from '../../utils/formatters';
import { SCHEDULE_STATUS } from '../../utils/constants';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [showAdd,   setShowAdd]   = useState(false);

  // Filter state
  const [filterDate,    setFilterDate]    = useState('');
  const [filterDoctor,  setFilterDoctor]  = useState('');

  // ── ADMIN: load lịch làm việc ──
  const fetchList = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = {
        page: pg, size: 10,
        sortBy: 'workDate', direction: 'DESC',
        ...(filterDate   ? { workDate: filterDate }  : {}),
        ...(filterDoctor ? { doctorId: filterDoctor } : {}),
      };
      const res = await adminGetSchedules(params);
      setSchedules(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { setSchedules([]); }
    finally { setLoading(false); }
  }, [page, filterDate, filterDoctor]);

  useState(() => { fetchList(); }, []);

  const handleFilter = e => {
    e.preventDefault();
    setPage(0);
    fetchList(0);
  };

  const getStatusStyle = (s) => SCHEDULE_STATUS[s] || { label: s, cls: 'bg-gray-100 text-gray-500' };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch làm việc</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} lịch trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          + Tạo lịch làm việc
        </button>
      </div>

      {/* Filter */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày làm việc</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white" />
        </div>
        <button type="submit" className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700">
          Lọc
        </button>
        <button type="button" onClick={() => { setFilterDate(''); setFilterDoctor(''); setPage(0); setTimeout(() => fetchList(0), 0); }}
          className="border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50">
          Xóa lọc
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Bác sĩ</th>
              <th className="px-5 py-3 text-left">Ngày</th>
              <th className="px-5 py-3 text-left">Giờ bắt đầu</th>
              <th className="px-5 py-3 text-center">Đã đặt / Tối đa</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : schedules.map(s => {
              const st = getStatusStyle(s.status);
              return (
                <tr key={s.scheduleId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{s.doctorName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{formatDate(s.workDate)}</td>
                  <td className="px-5 py-3.5 font-bold text-blue-600">{formatTime(s.startTime)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="font-semibold text-gray-700">{s.currentPatients ?? 0}</span>
                    <span className="text-gray-400">/{s.maxPatients}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {schedules.length} / {total}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => { setPage(p => p-1); fetchList(page-1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg">{page + 1}</span>
            <button disabled={schedules.length < 10} onClick={() => { setPage(p => p+1); fetchList(page+1); }}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      </div>

      {showAdd && <CreateScheduleModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchList(); }} />}
    </div>
  );
}

/* ── Modal tạo lịch làm việc ── */
function CreateScheduleModal({ onClose, onCreated }) {
  const [doctors,   setDoctors]   = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [form,      setForm]      = useState({
    doctorId: '', workDate: todayISO(), timeSlotId: '', maxPatients: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Load doctors và time slots khi mở modal
  useState(() => {
    getDoctors().then(res => setDoctors(Array.isArray(res) ? res : [])).catch(() => {});
    adminGetTimeSlots().then(res => setTimeSlots(Array.isArray(res) ? res : [])).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.doctorId || !form.workDate || !form.timeSlotId) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    try {
      // ── ADMIN: POST /api/admin/schedules ──
      await adminCreateSchedule({
        doctorId:    form.doctorId,
        workDate:    form.workDate,
        timeSlotId:  Number(form.timeSlotId),
        maxPatients: Number(form.maxPatients),
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Tạo lịch thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = t => t ? String(t).substring(0, 5) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Tạo lịch làm việc</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bác sĩ *</label>
            <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50">
              <option value="">Chọn bác sĩ...</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày làm việc *</label>
            <input type="date" value={form.workDate}
              onChange={e => setForm(f => ({ ...f, workDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Khung giờ *</label>
            <select value={form.timeSlotId} onChange={e => setForm(f => ({ ...f, timeSlotId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50">
              <option value="">Chọn khung giờ...</option>
              {timeSlots.map(t => <option key={t.id} value={t.id}>{fmt(t.startTime)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số bệnh nhân tối đa</label>
            <input type="number" min="1" max="50" value={form.maxPatients}
              onChange={e => setForm(f => ({ ...f, maxPatients: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang tạo...' : 'Tạo lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
