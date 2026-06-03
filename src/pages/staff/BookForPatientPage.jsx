/**
 * BookForPatientPage — Staff đặt lịch trực tiếp cho bệnh nhân tại quầy
 * Role  : STAFF
 * API   : POST /staff/appointments/patient/{patientId}
 */
import { useState } from 'react';
import { getDoctors, getAvailableSlots } from '../../api/public';
import { staffBookForPatient } from '../../api/staff';
import { todayISO } from '../../utils/formatters';

export default function BookForPatientPage() {
  const [patientId, setPatientId]         = useState('');
  const [doctors, setDoctors]             = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate]                   = useState(todayISO());
  const [slots, setSlots]                 = useState([]);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [symptoms, setSymptoms]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState('');

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(Array.isArray(res) ? res : []);
    } catch {
      setDoctors([]);
    }
  };

  const loadSlots = async (doctorId, d) => {
    try {
      const res = await getAvailableSlots({ doctorId, date: d });
      setSlots(Array.isArray(res) ? res : []);
    } catch {
      setSlots([]);
    }
  };

  const handleSubmit = async () => {
    if (!patientId || !selectedSlot) {
      setError('Thiếu thông tin bệnh nhân hoặc lịch hẹn.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await staffBookForPatient(patientId, {
        doctorId:   selectedDoctor.id,
        scheduleId: selectedSlot.scheduleId,
        symptoms:   symptoms || 'Không có triệu chứng cụ thể',
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Đặt lịch thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setPatientId('');
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSymptoms('');
    setError('');
  };

  if (success) return (
    <div className="p-8 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Đặt lịch thành công!</h2>
      <button
        onClick={handleReset}
        className="mt-4 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700"
      >
        Đặt lịch mới
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold text-gray-800">Đặt lịch tại quầy</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        {/* UUID bệnh nhân */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">UUID Bệnh nhân *</label>
          <input
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            placeholder="UUID của bệnh nhân trong hệ thống"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">Tra cứu CCCD ở trang Check-in để tìm UUID bệnh nhân</p>
        </div>

        {/* Ngày khám */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Ngày khám</label>
          <input
            type="date"
            value={date}
            onChange={e => {
              setDate(e.target.value);
              if (selectedDoctor) loadSlots(selectedDoctor.id, e.target.value);
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50"
          />
        </div>

        {/* Chọn bác sĩ */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Bác sĩ</label>
          <select
            value={selectedDoctor?.id || ''}
            onChange={e => {
              const doc = doctors.find(d => d.id === e.target.value);
              setSelectedDoctor(doc || null);
              setSelectedSlot(null);
              if (doc) loadSlots(doc.id, date);
            }}
            onFocus={() => { if (!doctors.length) loadDoctors(); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50"
          >
            <option value="">Chọn bác sĩ...</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.fullName}</option>
            ))}
          </select>
        </div>

        {/* Khung giờ */}
        {slots.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Khung giờ</label>
            <div className="flex flex-wrap gap-2">
              {slots.filter(s => s.status === 'AVAILABLE').map(s => (
                <button
                  key={s.scheduleId}
                  onClick={() => setSelectedSlot(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    selectedSlot?.scheduleId === s.scheduleId
                      ? 'border-purple-500 bg-purple-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {String(s.startTime).substring(0, 5)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Triệu chứng */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Triệu chứng</label>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={3}
            placeholder="Bệnh nhân mô tả triệu chứng..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !patientId || !selectedSlot}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-purple-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Đang đặt lịch...' : '✓ Xác nhận đặt lịch'}
        </button>
      </div>
    </div>
  );
}
