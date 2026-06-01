import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctors as mockDoctors } from '../data/mockData';
import { getDoctorById, getAvailableSlots, createAppointment } from '../api';

const STEPS = ['Chọn lịch', 'Thông tin', 'Xác nhận'];

function getNext7Days() {
  const days = [];
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];
  const monthNames = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({
      date:    d.toISOString().split('T')[0],
      dayName: i===0?'Hôm nay':i===1?'Ngày mai':dayNames[d.getDay()],
      dayNum:  d.getDate(),
      month:   monthNames[d.getMonth()],
    });
  }
  return days;
}

export default function Booking() {
  const { doctorId } = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { isAuthenticated, user } = useAuth();

  /* Redirect nếu chưa đăng nhập */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const days = getNext7Days();

  /* ── State ── */
  const [doctor,       setDoctor]       = useState(null);
  const [availSlots,   setAvailSlots]   = useState({}); // { "scheduleId": { timeLabel, booked } }
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step,         setStep]         = useState(0);
  const [selectedDate, setDate]         = useState(days[0].date);
  const [selectedSlot, setSlot]         = useState(null); // { scheduleId, timeLabel }
  const [visitType,    setVisitType]    = useState('first');
  const [form,         setForm]         = useState({ name: user?.name||'', phone: user?.phone||'', dob:'', gender:'female', reason:'', insurance:'' });
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [apiError,     setApiError]     = useState('');

  /* ── Load doctor ── */
  useEffect(() => {
    getDoctorById(doctorId)
      .then(setDoctor)
      .catch(() => setDoctor(mockDoctors.find(d => d.id === Number(doctorId)) || mockDoctors[0]));
  }, [doctorId]);

  /* ── Load available slots khi đổi ngày ── */
  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoadingSlots(true);
    setSlot(null);
    getAvailableSlots({ doctorId, date: selectedDate })
      .then((res) => {
        // BE trả: [{ scheduleId, startTime, endTime, available, booked }]
        const map = {};
        (Array.isArray(res) ? res : res?.data ?? []).forEach(s => {
          map[s.scheduleId] = {
            timeLabel: s.startTime ? `${s.startTime}–${s.endTime}` : s.label,
            available: s.available ?? !s.booked,
            scheduleId: s.scheduleId,
          };
        });
        setAvailSlots(map);
      })
      .catch(() => {
        // Fallback mock slots
        const mock = {};
        ['07:30','08:00','08:30','09:00','09:30','10:00','13:00','13:30','14:00','14:30','15:00'].forEach((t,i) => {
          mock[`mock-${i}`] = { timeLabel: t, available: !['08:00','09:30','14:00'].includes(t), scheduleId: `mock-${i}` };
        });
        setAvailSlots(mock);
      })
      .finally(() => setLoadingSlots(false));
  }, [doctorId, selectedDate]);

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const canNext0 = selectedDate && selectedSlot;
  const canNext1 = form.name.trim() && form.phone.trim();

  /* ── Submit đặt lịch ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError('');
    try {
      await createAppointment({
        doctorId:   doctorId,
        scheduleId: selectedSlot.scheduleId,
        symptoms:   form.reason || 'Không có triệu chứng cụ thể',
      });
      setSubmitted(true);
    } catch (err) {
      // Fallback: vẫn cho submit thành công khi mock
      if (selectedSlot?.scheduleId?.startsWith('mock')) {
        setSubmitted(true);
      } else {
        setApiError(err.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Thành công ── */
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
            Chúng tôi sẽ gửi SMS xác nhận đến <strong>{form.phone}</strong> trong vài phút.
          </p>
          <div className="bg-blue-50 rounded-2xl p-5 text-left space-y-2 mb-6 text-xs">
            <p className="font-bold text-blue-600 uppercase tracking-wider mb-2">Chi tiết lịch hẹn</p>
            {[
              ['Bác sĩ',   doctor.name],
              ['Ngày',     `${dayInfo?.dayName}, ${dayInfo?.dayNum} ${dayInfo?.month}`],
              ['Giờ',      selectedSlot?.timeLabel],
              ['Địa chỉ',  '123 Đường Láng, Đống Đa, Hà Nội'],
            ].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-400">{l}</span>
                <span className="font-semibold text-gray-700">{v}</span>
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

  /* ── Slot groups ── */
  const slotList = Object.values(availSlots);
  const morning   = slotList.filter(s => { const h = parseInt(s.timeLabel); return h < 12; });
  const afternoon = slotList.filter(s => { const h = parseInt(s.timeLabel); return h >= 12 && h < 17; });
  const evening   = slotList.filter(s => { const h = parseInt(s.timeLabel); return h >= 17; });

  const SlotGroup = ({ label, slots }) => slots.length === 0 ? null : (
    <div className="mb-4">
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map(s => (
          <button key={s.scheduleId} disabled={!s.available}
            onClick={() => setSlot(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              !s.available ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
              : selectedSlot?.scheduleId === s.scheduleId ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
            }`}>
            {s.timeLabel}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Step 0: Chọn lịch ── */
  const Step0 = () => (
    <div className="space-y-6">
      {/* Loại khám */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Loại khám</p>
        <div className="grid grid-cols-2 gap-3">
          {[{v:'first',l:'Khám lần đầu',i:'🆕',d:'Chưa từng khám tại đây'},{v:'revisit',l:'Tái khám',i:'🔄',d:'Đã có hồ sơ bệnh án'}].map(opt => (
            <button key={opt.v} onClick={() => setVisitType(opt.v)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${visitType===opt.v?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-2xl">{opt.i}</span>
              <div>
                <p className={`text-sm font-semibold ${visitType===opt.v?'text-blue-700':'text-gray-700'}`}>{opt.l}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.d}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chọn ngày */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Chọn ngày khám</p>
        <div className="grid grid-cols-7 gap-2">
          {days.map(d => (
            <button key={d.date} onClick={() => { setDate(d.date); setSlot(null); }}
              className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all ${selectedDate===d.date?'border-blue-500 bg-blue-600 text-white shadow-md':'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
              <span className={`text-[10px] font-medium ${selectedDate===d.date?'text-blue-200':'text-gray-400'}`}>{d.dayName}</span>
              <span className="text-lg font-bold leading-tight">{d.dayNum}</span>
              <span className={`text-[10px] ${selectedDate===d.date?'text-blue-200':'text-gray-400'}`}>{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chọn giờ */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Chọn giờ khám</p>
        {loadingSlots ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Đang tải khung giờ...
          </div>
        ) : (
          <>
            <SlotGroup label="🌅 Buổi sáng"  slots={morning} />
            <SlotGroup label="☀️ Buổi chiều" slots={afternoon} />
            <SlotGroup label="🌆 Buổi tối"   slots={evening} />
            {slotList.length === 0 && (
              <p className="text-sm text-gray-400 py-4">Không có khung giờ trống cho ngày này.</p>
            )}
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
              <span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded inline-block" />
              Khung giờ đã được đặt
            </p>
          </>
        )}
      </div>
    </div>
  );

  /* ── Step 1: Thông tin bệnh nhân ── */
  const Step1 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name:'name',  label:'Họ và tên *',       type:'text',  placeholder:'Nguyễn Văn A' },
          { name:'phone', label:'Số điện thoại *',   type:'text',  placeholder:'0912 345 678' },
          { name:'dob',   label:'Ngày sinh',          type:'date',  placeholder:'' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
            <input name={f.name} type={f.type} value={form[f.name]} onChange={handleFormChange}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới tính</label>
          <div className="flex gap-2">
            {[{v:'female',l:'Nữ'},{v:'male',l:'Nam'},{v:'other',l:'Khác'}].map(g => (
              <button key={g.v} type="button" onClick={() => setForm(f=>({...f,gender:g.v}))}
                className={`flex-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${form.gender===g.v?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600'}`}>
                {g.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số thẻ BHYT (nếu có)</label>
        <input name="insurance" value={form.insurance} onChange={handleFormChange}
          placeholder="DN4012345678901"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Triệu chứng / Lý do khám</label>
        <textarea name="reason" value={form.reason} onChange={handleFormChange} rows={4}
          placeholder="Mô tả ngắn gọn triệu chứng, thời gian xuất hiện..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 resize-none" />
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex gap-2">
        <span className="shrink-0">ℹ️</span>
        Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích khám chữa bệnh.
      </div>
    </div>
  );

  /* ── Step 2: Xác nhận ── */
  const Step2 = () => {
    const dayInfo = days.find(d => d.date === selectedDate);
    const rows = [
      ['Bác sĩ',      doctor.name],
      ['Chuyên khoa', doctor.specialty],
      ['Ngày khám',   `${dayInfo?.dayName}, ${dayInfo?.dayNum} ${dayInfo?.month}`, true],
      ['Giờ khám',    selectedSlot?.timeLabel, true],
      ['Loại khám',   visitType==='first'?'Khám lần đầu':'Tái khám'],
      ['Phí khám',    `${(doctor.price||0).toLocaleString('vi-VN')}đ`],
    ];
    const patientRows = [
      ['Họ tên',      form.name],
      ['Điện thoại',  form.phone],
      ...(form.dob ? [['Ngày sinh', form.dob]] : []),
      ['Giới tính',   form.gender==='female'?'Nữ':form.gender==='male'?'Nam':'Khác'],
      ...(form.insurance ? [['Số BHYT', form.insurance]] : []),
      ...(form.reason ? [['Lý do khám', form.reason]] : []),
    ];
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold text-green-800 text-sm">Kiểm tra lại thông tin trước khi xác nhận</p>
            <p className="text-xs text-green-600 mt-0.5">SMS xác nhận sẽ được gửi trong vòng 5 phút</p>
          </div>
        </div>
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex gap-2">
            <span>⚠️</span>{apiError}
          </div>
        )}
        {[['Thông tin lịch hẹn', rows], ['Thông tin bệnh nhân', patientRows]].map(([title, rowData]) => (
          <div key={title} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            </div>
            <div className="p-5 space-y-2.5">
              {rowData.map(([l,v,hi]) => (
                <div key={l} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-b-0">
                  <span className="text-gray-400">{l}</span>
                  <span className={`font-semibold text-right max-w-[60%] ${hi?'text-blue-600':'text-gray-700'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center">
          Bằng cách đặt lịch, bạn đồng ý với{' '}
          <a href="#" className="text-blue-500 hover:underline">Điều khoản sử dụng</a> của MedCare.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(step-1) : navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Đặt lịch khám</h1>
            <p className="text-xs text-gray-400">MedCare Clinic</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-7">

          {/* Form */}
          <div className="flex-1 min-w-0">
            {/* Stepper */}
            <div className="flex items-center mb-8">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i<step?'bg-green-500 text-white':i===step?'bg-blue-600 text-white shadow-md shadow-blue-200':'bg-gray-200 text-gray-400'}`}>
                      {i < step ? '✓' : i+1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${i===step?'text-blue-600':i<step?'text-green-600':'text-gray-400'}`}>{s}</span>
                  </div>
                  {i < STEPS.length-1 && <div className={`flex-1 h-0.5 mx-3 ${i<step?'bg-green-400':'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-6 text-base flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{step+1}</span>
                {STEPS[step]}
              </h2>
              {step===0 && <Step0 />}
              {step===1 && <Step1 />}
              {step===2 && <Step2 />}
            </div>

            <div className="flex justify-between mt-5">
              <button onClick={() => step>0?setStep(step-1):navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                ← {step===0?'Quay lại':'Bước trước'}
              </button>
              {step < 2 ? (
                <button onClick={() => setStep(step+1)}
                  disabled={step===0?!canNext0:!canNext1}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                  Tiếp theo →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-sm disabled:opacity-60">
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                  ) : '✓ Xác nhận đặt lịch'}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar bác sĩ */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="relative h-44 overflow-hidden">
                <img src={doctor.avatar || doctor.imageUrl} alt={doctor.name}
                  className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-bold text-sm">{doctor.name}</p>
                  <p className="text-blue-200 text-xs">{doctor.degree || doctor.academicTitle}</p>
                </div>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <p className="text-gray-500 flex items-center gap-1.5">🏥 <span className="line-clamp-2">{doctor.hospital}</span></p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="text-yellow-400">★</span><strong>{doctor.rating}</strong><span className="text-gray-400">({doctor.reviewCount})</span></span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{doctor.experience || doctor.experienceYears} năm KN</span>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí khám</span>
                    <span className="font-bold text-blue-600">{(doctor.price||0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedSlot && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày khám</span>
                        <span className="font-semibold text-gray-700">
                          {days.find(d=>d.date===selectedDate)?.dayNum} {days.find(d=>d.date===selectedDate)?.month}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Giờ khám</span>
                        <span className="font-semibold text-blue-600">{selectedSlot.timeLabel}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  <p className="font-semibold text-gray-700">📍 Địa chỉ</p>
                  <p className="text-gray-500">123 Đường Láng, Đống Đa, Hà Nội</p>
                  <p className="text-gray-400">⏰ T2–T7: 7:00–20:00 | CN: 7:00–12:00</p>
                </div>
                <a href="tel:1800599920"
                  className="flex items-center justify-center gap-2 w-full border border-blue-200 text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  📞 Gọi 1800 599 920
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
