import { useState, useEffect, useCallback } from 'react';

// ── ADMIN: schedule management ──
import { adminGetSchedules, adminCreateSchedule } from '../../../api/admin';
import { getDoctors } from '../../../api/public';
import { useTimeSlots } from '../../../hooks/useCatalog';

/* ── Mock data — fallback khi BE chưa chạy ── */
const MOCK_DOCTORS = [
  { id: 1, name: 'PGS.TS. Nguyễn Văn An', specialty: 'Tim mạch',   avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-red-500' },
  { id: 2, name: 'TS.BS. Trần Thị Bình',  specialty: 'Thần kinh',  avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-purple-500' },
  { id: 3, name: 'GS.TS. Lê Minh Châu',   specialty: 'Xương khớp', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-blue-500' },
  { id: 4, name: 'ThS.BS. Phạm Thị Dung', specialty: 'Nhi khoa',   avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-yellow-500' },
  { id: 5, name: 'BS.CKI. Hoàng Văn Em',  specialty: 'Da liễu',    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-green-500' },
  { id: 6, name: 'TS.BS. Vũ Thị Phương',  specialty: 'Mắt',        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=faces,top', color: 'bg-pink-500' },
];

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const DAY_DATES = ['26/05', '27/05', '28/05', '29/05', '30/05', '31/05', '01/06'];
const SHIFTS = [
  { id: 'morning',   label: 'Sáng',  time: '07:00 – 12:00', icon: '🌅' },
  { id: 'afternoon', label: 'Chiều', time: '13:00 – 17:00', icon: '☀️' },
  { id: 'evening',   label: 'Tối',   time: '17:00 – 20:00', icon: '🌆' },
];

/* Lịch phân công ban đầu: { "dayIdx-shiftId": [doctorId, ...] } */
const INIT_SCHEDULE = {
  '0-morning':   [1, 3], '0-afternoon': [2, 4], '0-evening': [5],
  '1-morning':   [1, 2], '1-afternoon': [3, 6], '1-evening': [4],
  '2-morning':   [2, 5], '2-afternoon': [1, 4], '2-evening': [],
  '3-morning':   [3, 6], '3-afternoon': [2, 5], '3-evening': [1],
  '4-morning':   [1, 4], '4-afternoon': [3, 6], '4-evening': [2],
  '5-morning':   [2, 3], '5-afternoon': [5],    '5-evening': [],
  '6-morning':   [1],    '6-afternoon': [],      '6-evening': [],
};

/* Lịch hẹn chờ phân công */
const PENDING_BOOKINGS = [
  { id: '#BK007', patient: 'Vũ Thị Nga',    specialty: 'Tim mạch',   date: '28/05/2026', time: '09:00', doctor: null,  note: 'Đau ngực, khó thở' },
  { id: '#BK008', patient: 'Bùi Văn Hải',   specialty: 'Thần kinh',  date: '28/05/2026', time: '10:30', doctor: null,  note: 'Đau đầu mãn tính' },
  { id: '#BK009', patient: 'Đinh Thị Lan',  specialty: 'Nhi khoa',   date: '29/05/2026', time: '08:00', doctor: null,  note: 'Trẻ sốt cao 3 ngày' },
  { id: '#BK010', patient: 'Ngô Minh Tuấn', specialty: 'Xương khớp', date: '30/05/2026', time: '14:00', doctor: null,  note: 'Đau lưng dưới' },
  { id: '#BK011', patient: 'Lý Thị Hương',  specialty: 'Mắt',        date: '27/05/2026', time: '15:00', doctor: 6,     note: 'Mờ mắt, nhức mắt' },
];

const STATUS_BOOKING = {
  assigned:  { label: 'Đã phân công', cls: 'bg-green-100 text-green-700' },
  unassigned:{ label: 'Chưa phân công', cls: 'bg-yellow-100 text-yellow-700' },
};

/* ── Modal phân công bác sĩ ── */
function AssignModal({ booking, onClose, onAssign, doctors }) {
  const [selected, setSelected] = useState(booking.doctor);
  const available = doctors.filter(d => d.specialty === booking.specialty);
  const others    = doctors.filter(d => d.specialty !== booking.specialty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-800">Phân công bác sĩ</h3>
            <p className="text-xs text-gray-400 mt-0.5">{booking.id} · {booking.patient}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
        </div>

        {/* Booking info */}
        <div className="px-6 py-4 bg-blue-50 mx-6 mt-4 rounded-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-400">Chuyên khoa</span><p className="font-bold text-gray-800 mt-0.5">{booking.specialty}</p></div>
            <div><span className="text-gray-400">Ngày khám</span><p className="font-bold text-gray-800 mt-0.5">{booking.date}</p></div>
            <div><span className="text-gray-400">Giờ khám</span><p className="font-bold text-blue-600 mt-0.5">{booking.time}</p></div>
            <div><span className="text-gray-400">Lý do</span><p className="font-bold text-gray-800 mt-0.5 line-clamp-1">{booking.note}</p></div>
          </div>
        </div>

        {/* Doctor list */}
        <div className="px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
          {available.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">✅ Đúng chuyên khoa</p>
              {available.map(d => (
                <button key={d.id} onClick={() => setSelected(d.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selected === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-xl object-cover object-top shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-800 text-sm">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.specialty}</p>
                  </div>
                  {selected === d.id && <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">✓</span>}
                </button>
              ))}
            </>
          )}
          {others.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Bác sĩ khác</p>
              {others.map(d => (
                <button key={d.id} onClick={() => setSelected(d.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all opacity-70 ${selected === d.id ? 'border-blue-500 bg-blue-50 opacity-100' : 'border-gray-100 hover:border-gray-200'}`}>
                  <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-xl object-cover object-top shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-800 text-sm">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.specialty}</p>
                  </div>
                  {selected === d.id && <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">✓</span>}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={() => { onAssign(booking.id, selected); onClose(); }}
            disabled={!selected}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-40">
            Xác nhận phân công
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal thêm ca làm việc ── */
function AddShiftModal({ cell, onClose, onSave, currentDoctors, doctors }) {
  const [selected, setSelected] = useState(currentDoctors);
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-800">Phân công ca làm việc</h3>
            <p className="text-xs text-gray-400 mt-0.5">{cell.day} · {cell.shift.label} ({cell.shift.time})</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-lg">×</button>
        </div>
        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chọn bác sĩ trực ca này</p>
          {doctors.map(d => (
            <button key={d.id} onClick={() => toggle(d.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selected.includes(d.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <img src={d.avatar} alt={d.name} className="w-9 h-9 rounded-xl object-cover object-top shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-800 text-sm">{d.name}</p>
                <p className="text-xs text-gray-400">{d.specialty}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected.includes(d.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                {selected.includes(d.id) && <span className="text-white text-[10px]">✓</span>}
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
          <button onClick={() => { onSave(cell.key, selected); onClose(); }}
            className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700">
            Lưu ca ({selected.length} bác sĩ)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Lịch hẹn chờ phân công ── */
function BookingAssignTab({ bookings, onAssign, doctors }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b =>
    b.patient.toLowerCase().includes(search.toLowerCase()) ||
    b.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const unassigned = filtered.filter(b => !b.doctor);
  const assigned   = filtered.filter(b => b.doctor);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-600">{bookings.filter(b => !b.doctor).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Chưa phân công</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">{bookings.filter(b => b.doctor).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Đã phân công</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-600">{bookings.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tổng lịch hẹn</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm bệnh nhân, chuyên khoa..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
      </div>

      {/* Chưa phân công */}
      {unassigned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <p className="text-sm font-bold text-gray-700">Chưa phân công ({unassigned.length})</p>
          </div>
          <div className="space-y-2">
            {unassigned.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border-2 border-yellow-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                  {b.id.replace('#BK', '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800 text-sm">{b.patient}</p>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{b.specialty}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📅 {b.date} · ⏰ {b.time} · {b.note}</p>
                </div>
                <button onClick={() => setModal(b)}
                  className="shrink-0 bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap">
                  + Phân công
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Đã phân công */}
      {assigned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <p className="text-sm font-bold text-gray-700">Đã phân công ({assigned.length})</p>
          </div>
          <div className="space-y-2">
            {assigned.map(b => {
              const doc = doctors.find(d => d.id === b.doctor);
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                    {b.id.replace('#BK', '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{b.patient}</p>
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{b.specialty}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">📅 {b.date} · ⏰ {b.time}</p>
                  </div>
                  {doc && (
                    <div className="flex items-center gap-2 shrink-0">
                      <img src={doc.avatar} alt={doc.name} className="w-8 h-8 rounded-full object-cover object-top" />
                      <div className="hidden sm:block">
                        <p className="text-xs font-bold text-gray-700 leading-tight">{doc.name.split('. ').pop()}</p>
                        <p className="text-[10px] text-gray-400">{doc.specialty}</p>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setModal(b)}
                    className="shrink-0 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    Đổi
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <AssignModal booking={modal} onClose={() => setModal(null)}
          onAssign={(id, docId) => onAssign(id, docId)} />
      )}
    </div>
  );
}

/* ── Tab: Lịch ca tuần ── */
function WeeklyScheduleTab({ schedule, onUpdateCell }) {
  const [modal, setModal] = useState(null); // { key, day, shift, dayIdx }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {DOCTORS.map(d => (
          <div key={d.id} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
            <span className="text-xs font-medium text-gray-600">{d.name.split('. ').pop()}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-100">
          <div className="px-3 py-3 bg-gray-50 border-r border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase">Ca / Ngày</p>
          </div>
          {DAYS.map((d, i) => (
            <div key={d} className={`px-2 py-3 text-center border-r border-gray-100 last:border-r-0 ${i === 1 ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-bold ${i === 1 ? 'text-blue-600' : 'text-gray-500'}`}>{d}</p>
              <p className={`text-sm font-extrabold mt-0.5 ${i === 1 ? 'text-blue-700' : 'text-gray-700'}`}>{DAY_DATES[i]}</p>
            </div>
          ))}
        </div>

        {/* Rows */}
        {SHIFTS.map(shift => (
          <div key={shift.id} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
            {/* Shift label */}
            <div className="px-3 py-3 bg-gray-50 border-r border-gray-100 flex flex-col justify-center">
              <p className="text-sm">{shift.icon}</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{shift.label}</p>
              <p className="text-[10px] text-gray-400">{shift.time}</p>
            </div>

            {/* Cells */}
            {DAYS.map((day, dayIdx) => {
              const key = `${dayIdx}-${shift.id}`;
              const docIds = schedule[key] || [];
              const docs = docIds.map(id => DOCTORS.find(d => d.id === id)).filter(Boolean);

              return (
                <div key={day}
                  className={`px-2 py-2 border-r border-gray-100 last:border-r-0 min-h-[80px] ${dayIdx === 1 ? 'bg-blue-50/30' : ''}`}>
                  {/* Doctor chips */}
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {docs.map(d => (
                      <div key={d.id} title={d.name}
                        className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-sm">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${d.color}`} />
                        <span className="text-[10px] font-semibold text-gray-600 hidden lg:block truncate max-w-[60px]">
                          {d.name.split(' ').pop()}
                        </span>
                        <img src={d.avatar} alt={d.name} className="w-4 h-4 rounded-full object-cover object-top lg:hidden" />
                      </div>
                    ))}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => setModal({ key, day, shift, dayIdx })}
                    className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg py-1 transition-colors border border-dashed border-gray-200 hover:border-blue-300">
                    <span>+</span>
                    <span className="hidden sm:inline">{docs.length > 0 ? 'Sửa' : 'Thêm'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary per doctor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-sm mb-4">Tổng ca làm việc tuần này</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOCTORS.map(d => {
            const count = Object.values(schedule).filter(ids => ids.includes(d.id)).length;
            return (
              <div key={d.id} className="text-center">
                <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-xl object-cover object-top mx-auto mb-1.5" />
                <p className="text-xs font-bold text-gray-700 leading-tight truncate">{d.name.split(' ').pop()}</p>
                <p className="text-xs text-gray-400">{d.specialty}</p>
                <div className={`mt-1.5 text-sm font-extrabold ${count >= 5 ? 'text-red-600' : count >= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {count} ca
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <AddShiftModal
          cell={modal}
          currentDoctors={schedule[modal.key] || []}
          onClose={() => setModal(null)}
          onSave={(key, doctors) => { onUpdateCell(key, doctors); }}
        />
      )}
    </div>
  );
}

/* ── Main export ── */
export default function SchedulePage() {
  const [tab, setTab] = useState('assign');
  const [bookings, setBookings] = useState(PENDING_BOOKINGS);
  const [schedule, setSchedule] = useState(INIT_SCHEDULE);
  const [saved, setSaved] = useState(false);

  const handleAssign = (bookingId, doctorId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, doctor: doctorId } : b));
  };

  const handleUpdateCell = (key, doctorIds) => {
    setSchedule(prev => ({ ...prev, [key]: doctorIds }));
  };

  const handleSaveSchedule = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Phân công lịch làm việc</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tuần 26/05 – 01/06/2026</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-green-600 text-sm font-semibold">✓ Đã lưu</span>}
          <button onClick={handleSaveSchedule}
            className="bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
            💾 Lưu lịch tuần
          </button>
          <button className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            📤 Xuất PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'assign', label: '📋 Phân công lịch hẹn', count: bookings.filter(b => !b.doctor).length },
          { key: 'weekly', label: '📅 Lịch ca tuần', count: null },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {t.count > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'assign' && <BookingAssignTab bookings={bookings} onAssign={handleAssign} />}
      {tab === 'weekly' && <WeeklyScheduleTab schedule={schedule} onUpdateCell={handleUpdateCell} />}
    </div>
  );
}
