/**
 * StaffBookPage — Đặt lịch tại quầy
 * POST /staff/appointments/patient/{patientId}
 */
import { useState, useEffect } from 'react';
import { getDoctors, getAvailableSlots } from '../../../api/public';
import { staffBookForPatient } from '../../../api/staff';
import { mapDoctorFromApi } from '../../../utils/doctorMapper';
import { todayISO } from '../../../utils/formatters';

export default function StaffBookPage() {
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [workDate, setWorkDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [scheduleId, setScheduleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getDoctors({})
      .then(res => setDoctors((Array.isArray(res) ? res : []).map(mapDoctorFromApi).filter(Boolean)))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (!doctorId || !workDate) { setSlots([]); return; }
    getAvailableSlots({ doctorId, date: workDate })
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setSlots(list.filter(s => s.status === 'AVAILABLE'));
      })
      .catch(() => setSlots([]));
    setScheduleId('');
  }, [doctorId, workDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!patientId.trim()) { setError('Nhập mã bệnh nhân (UUID từ hệ thống).'); return; }
    if (!doctorId || !scheduleId) { setError('Chọn bác sĩ và khung giờ.'); return; }
    setLoading(true);
    try {
      await staffBookForPatient(patientId.trim(), { doctorId, scheduleId, symptoms });
      setMessage('Đặt lịch thành công!');
      setSymptoms('');
      setScheduleId('');
    } catch (err) {
      setError(err.message || 'Đặt lịch thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Đặt lịch tại quầy</h1>
        <p className="text-sm text-gray-400 mt-0.5">Dành cho nhân viên lễ tân — cần mã bệnh nhân (UUID)</p>
      </div>

      {message && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Mã bệnh nhân (UUID) *</label>
          <input value={patientId} onChange={e => setPatientId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Bác sĩ *</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
            <option value="">— Chọn bác sĩ —</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Ngày khám *</label>
          <input type="date" value={workDate} min={todayISO()} onChange={e => setWorkDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Khung giờ *</label>
          <select value={scheduleId} onChange={e => setScheduleId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" disabled={!slots.length}>
            <option value="">{slots.length ? '— Chọn giờ —' : 'Không có slot trống'}</option>
            {slots.map(s => (
              <option key={s.scheduleId} value={s.scheduleId}>
                {(s.startTime || '').substring(0, 5)} ({s.currentPatients}/{s.maxPatients})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Triệu chứng</label>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-60">
          {loading ? 'Đang đặt...' : 'Xác nhận đặt lịch'}
        </button>
      </form>
    </div>
  );
}
