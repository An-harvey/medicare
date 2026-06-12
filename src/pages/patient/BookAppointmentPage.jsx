/**
 * BookAppointmentPage — Luồng đặt lịch khám (PATIENT)
 * 1. GET /public/doctors → thông tin bác sĩ
 * 2. GET /public/schedules/available → chọn khung giờ
 * 3. POST /patient/appointments → { doctorId, scheduleId, symptoms }
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlots, getDoctorById } from '../../api/public';
import { getPatientProfile, bookAppointment } from '../../api/patient';
import { mapDoctorFromApi } from '../../utils/doctorMapper';
import { unwrapList } from '../../utils/apiHelpers';
import { safeGoBack } from '../../utils/navigation';
import { formatTime } from '../../utils/formatters';

const STEPS = ['Chọn lịch', 'Thông tin', 'Xác nhận'];

function getNext7Days() {
  const days = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
}

function normalizeSlot(s) {
  const scheduleId = s.scheduleId ?? s.id;
  if (!scheduleId) return null;
  const available =
    s.status === 'AVAILABLE' ||
    s.available === true ||
    (s.currentPatients != null && s.maxPatients != null
      ? s.currentPatients < s.maxPatients
      : true);
  return {
    scheduleId: String(scheduleId),
    timeLabel: formatTime(s.startTime),
    available,
  };
}

function slotHour(timeLabel) {
  const h = parseInt(String(timeLabel).split(':')[0], 10);
  return Number.isNaN(h) ? 0 : h;
}

function SlotButtons({ label, slots, selectedSlot, onSelect }) {
  if (!slots.length) return null;
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map(s => (
          <button
            key={s.scheduleId}
            type="button"
            disabled={!s.available}
            onClick={() => onSelect(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              !s.available
                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                : selectedSlot?.scheduleId === s.scheduleId
                  ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
            }`}
          >
            {s.timeLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const days = useMemo(() => getNext7Days(), []);

  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState('');
  const [availSlots, setAvailSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [step, setStep] = useState(0);
  const [selectedDate, setDate] = useState(() => getNext7Days()[0].date);
  const [selectedSlot, setSlot] = useState(null);
  const [visitType, setVisitType] = useState('first');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'female',
    reason: '',
    insurance: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const isPatient = user?.beRole === 'PATIENT' || user?.role === 'user';

  useEffect(() => {
    if (!doctorId) {
      setDoctorLoading(false);
      setDoctorError('Thiếu mã bác sĩ trên URL.');
      return;
    }
    setDoctorLoading(true);
    setDoctorError('');
    getDoctorById(doctorId)
      .then(res => {
        if (!res) {
          setDoctor(null);
          setDoctorError('Không tìm thấy bác sĩ. Vui lòng chọn lại từ danh sách.');
          return;
        }
        setDoctor(mapDoctorFromApi(res));
      })
      .catch(err => {
        setDoctor(null);
        setDoctorError(err?.message || 'Không thể tải thông tin bác sĩ.');
      })
      .finally(() => setDoctorLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!isAuthenticated || !isPatient) return;
    getPatientProfile()
      .then(res => {
        setForm(f => ({
          ...f,
          name: res.fullName || f.name || user?.name || '',
          phone: res.phone || f.phone || user?.phone || '',
          dob: res.dob || f.dob,
        }));
      })
      .catch(() => {
        setForm(f => ({
          ...f,
          name: f.name || user?.name || '',
          phone: f.phone || user?.phone || '',
        }));
      });
  }, [isAuthenticated, isPatient, user]);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoadingSlots(true);
    setSlot(null);
    setSlotsError('');

    getAvailableSlots({ doctorId, date: selectedDate })
      .then(res => {
        const slots = unwrapList(res).map(normalizeSlot).filter(Boolean);
        setAvailSlots(slots);
        if (slots.length === 0) {
          setSlotsError('Không có lịch trống cho ngày này. Admin cần tạo lịch làm việc cho bác sĩ.');
        }
      })
      .catch(err => {
        setAvailSlots([]);
        setSlotsError(err?.message || 'Không thể tải khung giờ.');
      })
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

  const backTarget = doctorId ? `/doctors/${doctorId}` : '/doctors';

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else safeGoBack(navigate, backTarget, location);
  };

  const handleFormChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const canNext0 = selectedDate && selectedSlot?.available;
  const canNext1 = form.name.trim() && form.phone.trim() && form.reason.trim();

  const handleSubmit = async () => {
    if (!selectedSlot?.scheduleId) {
      setApiError('Vui lòng chọn khung giờ khám.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      await bookAppointment({
        doctorId: doctor?.id ?? doctorId,
        scheduleId: selectedSlot.scheduleId,
        symptoms: form.reason.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err?.message || 'Đặt lịch thất bại.';
      if (err?.status === 403) {
        setApiError('Chỉ tài khoản bệnh nhân mới được đặt lịch online.');
      } else if (err?.status === 401) {
        setApiError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setApiError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  if (!isPatient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể đặt lịch</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tài khoản <strong>{user?.label || user?.role}</strong> không dùng để đặt lịch online.
            Vui lòng đăng xuất và đăng nhập bằng tài khoản <strong>bệnh nhân</strong>.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/register" className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm">Đăng ký bệnh nhân</Link>
            <Link to="/doctors" className="border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm">← Quay lại</Link>
          </div>
        </div>
      </div>
    );
  }

  if (doctorLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="font-semibold text-gray-700">{doctorError || 'Không tìm thấy bác sĩ'}</p>
        <Link to="/doctors" className="text-blue-600 text-sm hover:underline">← Quay lại danh sách bác sĩ</Link>
      </div>
    );
  }

  if (submitted) {
    const dayInfo = days.find(d => d.date === selectedDate);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Đặt lịch thành công!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Lịch hẹn đã được ghi nhận. Trạng thái: <strong>Chờ xác nhận</strong>.
          </p>
          <div className="bg-blue-50 rounded-2xl p-5 text-left space-y-2 mb-6 text-xs">
            {[
              ['Bác sĩ', doctor.name],
              ['Ngày', `${dayInfo?.dayName}, ${dayInfo?.dayNum} ${dayInfo?.month}`],
              ['Giờ', selectedSlot?.timeLabel],
              ['Triệu chứng', form.reason || '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-gray-400 shrink-0">{l}</span>
                <span className="font-semibold text-gray-700 text-right">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard/bookings" className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700">
              Xem lịch hẹn của tôi
            </Link>
            <Link to="/doctors" className="border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">
              Đặt lịch khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const morning = availSlots.filter(s => slotHour(s.timeLabel) < 12);
  const afternoon = availSlots.filter(s => {
    const h = slotHour(s.timeLabel);
    return h >= 12 && h < 17;
  });
  const evening = availSlots.filter(s => slotHour(s.timeLabel) >= 17);
  const dayInfo = days.find(d => d.date === selectedDate);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button type="button" onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Đặt lịch khám</h1>
            <p className="text-xs text-gray-400">{doctor.name} · {doctor.specialty || '—'}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center mb-8 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="ml-2 text-xs font-semibold text-gray-600 hidden sm:inline">{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Loại khám</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'first', l: 'Khám lần đầu', i: '🆕' },
                    { v: 'revisit', l: 'Tái khám', i: '🔄' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setVisitType(opt.v)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left ${
                        visitType === opt.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{opt.i}</span>
                      <p className="text-sm font-semibold text-gray-700">{opt.l}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Chọn ngày khám</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map(d => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => { setDate(d.date); setSlot(null); }}
                      className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all ${
                        selectedDate === d.date
                          ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <span className={`text-[10px] font-medium ${selectedDate === d.date ? 'text-blue-200' : 'text-gray-400'}`}>
                        {d.dayName}
                      </span>
                      <span className="text-lg font-bold">{d.dayNum}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Chọn giờ khám</p>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Đang tải khung giờ...
                  </div>
                ) : (
                  <>
                    {slotsError && (
                      <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                        ⚠️ {slotsError}
                      </div>
                    )}
                    <SlotButtons label="🌅 Buổi sáng" slots={morning} selectedSlot={selectedSlot} onSelect={setSlot} />
                    <SlotButtons label="☀️ Buổi chiều" slots={afternoon} selectedSlot={selectedSlot} onSelect={setSlot} />
                    <SlotButtons label="🌆 Buổi tối" slots={evening} selectedSlot={selectedSlot} onSelect={setSlot} />
                    {!slotsError && availSlots.length === 0 && (
                      <p className="text-sm text-gray-400 py-4">Không có khung giờ trống cho ngày này.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và tên *</label>
                  <input name="name" value={form.name} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại *</label>
                  <input name="phone" value={form.phone} onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Triệu chứng / Lý do khám *</label>
                <textarea name="reason" value={form.reason} onChange={handleFormChange} rows={4}
                  placeholder="VD: Đau đầu, sốt 2 ngày..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">⚠️ {apiError}</div>
              )}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 text-sm">
                <p><span className="text-gray-400">Bác sĩ:</span> <strong>{doctor.name}</strong></p>
                <p><span className="text-gray-400">Ngày:</span> <strong>{dayInfo?.dayName}, {dayInfo?.dayNum}/{selectedDate}</strong></p>
                <p><span className="text-gray-400">Giờ:</span> <strong className="text-blue-600">{selectedSlot?.timeLabel}</strong></p>
                <p><span className="text-gray-400">Triệu chứng:</span> {form.reason || '—'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={handleBack}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ← {step === 0 ? 'Quay lại' : 'Bước trước'}
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !canNext0 : !canNext1}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Đang xử lý...' : '✓ Xác nhận đặt lịch'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
