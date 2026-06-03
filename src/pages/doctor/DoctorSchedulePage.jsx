/**
 * DoctorSchedulePage — Lịch khám của bác sĩ
 * ─────────────────────────────────────────
 * Role : DOCTOR
 * API  : GET /api/doctor/schedules?date=yyyy-MM-dd → List<ScheduleResponseDTO>
 *
 * ScheduleResponseDTO:
 *   { scheduleId, doctorId, doctorName, workDate, startTime,
 *     maxPatients, currentPatients, status: ScheduleStatus }
 *
 * ScheduleStatus: AVAILABLE | FULL | CANCELLED (từ enum ScheduleStatus.java)
 * startTime: LocalTime trả về dạng "HH:mm:ss" hoặc array [H,m,s]
 */
import { useState, useEffect } from 'react';
import { getDoctorSchedulesByDate } from '../../api/doctor';

const WEEK_DAYS = ['T2','T3','T4','T5','T6','T7','CN'];

// ── Tạo 7 ngày từ hôm nay ──
function getNext7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date:    d.toISOString().split('T')[0],  // "yyyy-MM-dd"
      label:   i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      dayNum:  d.getDate(),
      month:   d.getMonth() + 1,
    });
  }
  return days;
}

// ── Parse LocalTime từ BE ──
function formatTime(t) {
  if (!t) return '---';
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).substring(0, 5);
}

const STATUS_STYLE = {
  AVAILABLE:  { label: 'Còn trống',  cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  FULL:       { label: 'Đã đầy',     cls: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
  CANCELLED:  { label: 'Đã hủy',     cls: 'bg-gray-100 text-gray-400',    dot: 'bg-gray-400' },
};

export default function DoctorSchedulePage() {
  const days = getNext7Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [slots,       setSlots]       = useState([]);
  const [loading,     setLoading]     = useState(false);

  // ── DOCTOR: load lịch theo ngày đã chọn ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSlots([]);

    getDoctorSchedulesByDate(selectedDay.date)
      .then(res => {
        if (!cancelled) setSlots(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        // Fallback: mock data cho ngày được chọn (demo)
        if (!cancelled && selectedDay.label === 'Hôm nay') {
          setSlots([
            { scheduleId:'s1', startTime:'08:30', maxPatients:5, currentPatients:3, status:'AVAILABLE' },
            { scheduleId:'s2', startTime:'09:00', maxPatients:5, currentPatients:5, status:'FULL' },
            { scheduleId:'s3', startTime:'09:30', maxPatients:5, currentPatients:2, status:'AVAILABLE' },
            { scheduleId:'s4', startTime:'14:00', maxPatients:5, currentPatients:1, status:'AVAILABLE' },
          ]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedDay.date]);

  const getStatusStyle = (s) => STATUS_STYLE[s] || { label: s, cls:'bg-gray-100 text-gray-500', dot:'bg-gray-400' };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch khám của tôi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Xem lịch làm việc theo ngày</p>
        </div>
      </div>

      {/* ── Chọn ngày ── */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(d => (
          <button key={d.date} onClick={() => setSelectedDay(d)}
            className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${
              selectedDay.date === d.date
                ? 'border-green-500 bg-green-600 text-white shadow-md'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}>
            <span className={`text-[10px] font-semibold ${selectedDay.date === d.date ? 'text-green-200' : 'text-gray-400'}`}>{d.label}</span>
            <span className="text-lg font-extrabold leading-tight">{d.dayNum}</span>
            <span className={`text-[10px] ${selectedDay.date === d.date ? 'text-green-200' : 'text-gray-400'}`}>/{d.month}</span>
          </button>
        ))}
      </div>

      {/* ── Danh sách slot ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <div className="text-5xl mb-3">🏖️</div>
          <p className="font-semibold text-gray-600">Không có lịch khám ngày này</p>
          <p className="text-sm mt-1">Admin chưa xếp lịch cho ngày {selectedDay.date}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{selectedDay.label} — {selectedDay.date}</h2>
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">{slots.length} khung giờ</span>
          </div>
          <div className="divide-y divide-gray-50">
            {slots.map(s => {
              const st = getStatusStyle(s.status);
              return (
                <div key={s.scheduleId} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-0.5 h-10 rounded-full shrink-0 ${st.dot}`} />
                  <div className="text-center w-16 shrink-0">
                    <p className="text-sm font-extrabold text-gray-700">{formatTime(s.startTime)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">{s.currentPatients}</span>/{s.maxPatients} bệnh nhân
                    </p>
                    {/* Progress bar */}
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-32">
                      <div className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(s.currentPatients / s.maxPatients) * 100}%` }} />
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
