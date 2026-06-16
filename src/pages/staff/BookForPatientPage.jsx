/**
 * BookForPatientPage — Staff đặt lịch tại quầy cho bệnh nhân
 * ─────────────────────────────────────────────────────────────
 * Role : STAFF
 * Flow :
 *   1. Tra cứu bệnh nhân theo CCCD → GET /staff/appointments?cccd= → lấy patientId
 *   2. Chọn bác sĩ → GET /public/doctors
 *   3. Chọn ngày + khung giờ → GET /public/schedules/available
 *   4. Nhập triệu chứng → POST /staff/appointments/patient/{patientId}
 */
import { useState } from 'react';
import { getDoctors, getAvailableSlots } from '../../api/public';
import { staffSearchAppointments, staffBookForPatient } from '../../api/staff';
import { mapDoctorFromApi } from '../../utils/doctorMapper';
import { unwrapList } from '../../utils/apiHelpers';
import { todayISO, formatTime } from '../../utils/formatters';

// Bước đặt lịch
const STEPS = ['Tìm bệnh nhân', 'Chọn lịch', 'Xác nhận'];

export default function BookForPatientPage() {
  const [step, setStep] = useState(0);

  // Step 0 — Tìm bệnh nhân qua CCCD
  const [cccd,          setCccd]          = useState('');
  const [searching,     setSearching]     = useState(false);
  const [searchError,   setSearchError]   = useState('');
  const [patient,       setPatient]       = useState(null); // { patientId, patientName }

  // Step 1 — Chọn bác sĩ, ngày, khung giờ
  const [doctors,       setDoctors]       = useState([]);
  const [loadingDocs,   setLoadingDocs]   = useState(false);
  const [selectedDoctor,setSelectedDoctor]= useState(null);
  const [date,          setDate]          = useState(todayISO());
  const [slots,         setSlots]         = useState([]);
  const [loadingSlots,  setLoadingSlots]  = useState(false);
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [symptoms,      setSymptoms]      = useState('');

  // Submit
  const [submitting,    setSubmitting]    = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  /* ── Step 0: Tìm bệnh nhân theo CCCD ── */
  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!cccd.trim()) return;
    setSearching(true);
    setSearchError('');
    setPatient(null);
    try {
      const res = await staffSearchAppointments({ cccd: cccd.trim() });
      const list = Array.isArray(res) ? res : [];
      if (list.length === 0) {
        setSearchError('Không tìm thấy bệnh nhân với CCCD này. Vui lòng kiểm tra lại.');
        return;
      }
      // Lấy patientId và patientName từ appointment đầu tiên
      const first = list[0];
      setPatient({
        patientId:   first.patientId ?? first.appointmentId, // dùng appointmentId nếu BE chưa trả patientId
        patientName: first.patientName,
        cccd:        cccd.trim(),
      });
    } catch (e) {
      setSearchError(e?.message || 'Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setSearching(false);
    }
  };

  /* ── Step 1: Load bác sĩ ── */
  const handleNextToSchedule = async () => {
    setStep(1);
    if (doctors.length) return;
    setLoadingDocs(true);
    try {
      const res = await getDoctors({});
      setDoctors(unwrapList(res).map(mapDoctorFromApi).filter(Boolean));
    } catch {
      setDoctors([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  /* ── Khi chọn bác sĩ hoặc đổi ngày → load slot ── */
  const loadSlots = async (doctorId, d) => {
    if (!doctorId || !d) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    setSlots([]);
    try {
      const res = await getAvailableSlots({ doctorId, date: d });
      setSlots(unwrapList(res).filter(s => s.status === 'AVAILABLE' || s.currentPatients < s.maxPatients));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    const doc = doctors.find(d => String(d.id) === String(doctorId));
    setSelectedDoctor(doc || null);
    setSelectedSlot(null);
    if (doc) loadSlots(doc.id, date);
  };

  const handleDateChange = (d) => {
    setDate(d);
    setSelectedSlot(null);
    if (selectedDoctor) loadSlots(selectedDoctor.id, d);
  };

  /* ── Step 2: Xác nhận đặt lịch ── */
  const handleSubmit = async () => {
    if (!patient?.patientId || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await staffBookForPatient(patient.patientId, {
        doctorId:   selectedDoctor.id,
        scheduleId: selectedSlot.scheduleId ?? selectedSlot.id,
        symptoms:   symptoms.trim() || 'Không có triệu chứng cụ thể',
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err?.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSuccess(false);
    setCccd('');
    setPatient(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSymptoms('');
    setSubmitError('');
    setSearchError('');
  };

  /* ── Thành công ── */
  if (success) return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold text-gray-800 mb-2">Đặt lịch thành công!</h2>
      <p className="text-sm text-gray-500 mb-2">
        Lịch đã được tạo với trạng thái <strong className="text-blue-600">CONFIRMED</strong>.
        Khi bệnh nhân đến, staff bấm <strong>Check-in</strong> để chuyển sang CHECK_IN.
      </p>
      <div className="bg-blue-50 rounded-2xl p-4 text-left text-xs space-y-1.5 mb-6">
        <p><span className="text-gray-400">Bác sĩ:</span> <strong>{selectedDoctor?.name}</strong></p>
        <p><span className="text-gray-400">Ngày:</span> <strong>{date}</strong></p>
        <p><span className="text-gray-400">Giờ:</span> <strong>{formatTime(selectedSlot?.startTime)}</strong></p>
        <p><span className="text-gray-400">Triệu chứng:</span> {symptoms || '—'}</p>
      </div>
      <button onClick={handleReset}
        className="bg-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 w-full">
        Đặt lịch mới
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Đặt lịch tại quầy</h1>
        <p className="text-sm text-gray-400 mt-0.5">Đặt lịch khám hộ bệnh nhân</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className="ml-1.5 text-xs font-semibold text-gray-600 hidden sm:inline">{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Tìm bệnh nhân ── */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-700">Tra cứu bệnh nhân</h2>

          <form onSubmit={handleSearchPatient} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Số CCCD bệnh nhân *</label>
              <div className="flex gap-2">
                <input
                  value={cccd}
                  onChange={e => { setCccd(e.target.value); setSearchError(''); setPatient(null); }}
                  placeholder="Nhập 12 số CCCD..."
                  maxLength={12}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
                />
                <button type="submit" disabled={searching || cccd.length < 9}
                  className="bg-purple-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-40 transition-colors shrink-0">
                  {searching ? '...' : '🔍 Tìm'}
                </button>
              </div>
              {searchError && (
                <p className="text-xs text-red-600 mt-2">⚠️ {searchError}</p>
              )}
            </div>
          </form>

          {/* Kết quả tìm thấy */}
          {patient && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                {patient.patientName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">{patient.patientName}</p>
                <p className="text-xs text-green-600">CCCD: {patient.cccd}</p>
              </div>
              <span className="ml-auto text-green-600 text-lg">✓</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              disabled={!patient}
              onClick={handleNextToSchedule}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-40 transition-colors"
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Chọn lịch ── */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
            <span className="text-sm">👤</span>
            <div>
              <p className="text-xs text-gray-400">Bệnh nhân</p>
              <p className="font-bold text-gray-800 text-sm">{patient?.patientName}</p>
            </div>
          </div>

          {/* Chọn ngày */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Ngày khám</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => handleDateChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
            />
          </div>

          {/* Chọn bác sĩ */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Bác sĩ *</label>
            {loadingDocs ? (
              <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Đang tải danh sách bác sĩ...
              </div>
            ) : (
              <select
                value={selectedDoctor?.id || ''}
                onChange={e => handleDoctorChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialty}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Khung giờ */}
          {selectedDoctor && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">Khung giờ *</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Đang tải khung giờ...
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">Không có khung giờ trống cho ngày này.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(s => (
                    <button
                      key={s.scheduleId ?? s.id}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        (selectedSlot?.scheduleId ?? selectedSlot?.id) === (s.scheduleId ?? s.id)
                          ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      {formatTime(s.startTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Triệu chứng */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Triệu chứng / Lý do khám</label>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Bệnh nhân mô tả triệu chứng tại quầy..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 resize-none"
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              ← Quay lại
            </button>
            <button
              disabled={!selectedDoctor || !selectedSlot}
              onClick={() => setStep(2)}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-40 transition-colors"
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Xác nhận ── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-700">Xác nhận thông tin</h2>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠️ {submitError}
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">
            {[
              ['Bệnh nhân',   patient?.patientName],
              ['CCCD',        patient?.cccd],
              ['Bác sĩ',      selectedDoctor?.name],
              ['Chuyên khoa', selectedDoctor?.specialty],
              ['Ngày khám',   date],
              ['Giờ khám',    formatTime(selectedSlot?.startTime)],
              ['Triệu chứng', symptoms || '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-gray-400 shrink-0">{l}</span>
                <span className="font-semibold text-gray-700 text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              ← Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {submitting ? 'Đang đặt...' : '✓ Xác nhận đặt lịch'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
