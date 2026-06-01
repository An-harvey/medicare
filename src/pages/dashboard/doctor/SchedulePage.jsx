import { useState } from 'react';

const WEEK_DAYS = ['T2','T3','T4','T5','T6','T7','CN'];
const WEEK_DATES = ['26/05','27/05','28/05','29/05','30/05','31/05','01/06'];

const mySchedule = {
  '1': [ // T3 = index 1
    { time:'08:30', patient:'Lê Văn Cường',   type:'Tái khám',  status:'done',    room:'P101' },
    { time:'09:00', patient:'Phạm Thu Hà',    type:'Lần đầu',   status:'current', room:'P101' },
    { time:'09:30', patient:'Nguyễn Thị Mai', type:'Tái khám',  status:'waiting', room:'P101' },
    { time:'10:00', patient:'Trần Minh Đức',  type:'Lần đầu',   status:'waiting', room:'P101' },
    { time:'14:00', patient:'Hoàng Thị Lan',  type:'Tái khám',  status:'waiting', room:'P101' },
    { time:'14:30', patient:'Vũ Quang Huy',   type:'Lần đầu',   status:'waiting', room:'P101' },
  ],
  '3': [
    { time:'08:00', patient:'Bùi Văn Hải',    type:'Lần đầu',   status:'waiting', room:'P101' },
    { time:'09:00', patient:'Đinh Thị Lan',   type:'Tái khám',  status:'waiting', room:'P101' },
    { time:'10:30', patient:'Lý Thị Hương',   type:'Lần đầu',   status:'waiting', room:'P101' },
  ],
  '4': [
    { time:'08:30', patient:'Ngô Minh Tuấn',  type:'Tái khám',  status:'waiting', room:'P101' },
    { time:'09:30', patient:'Phan Thị Linh',  type:'Lần đầu',   status:'waiting', room:'P101' },
  ],
};

const STATUS_STYLE = {
  done:    { label:'Đã khám',   cls:'bg-gray-100 text-gray-500',   dot:'bg-gray-400' },
  current: { label:'Đang khám', cls:'bg-green-100 text-green-700', dot:'bg-green-500' },
  waiting: { label:'Chờ',       cls:'bg-blue-100 text-blue-700',   dot:'bg-blue-500' },
};

export default function DoctorSchedulePage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const slots = mySchedule[String(selectedDay)] || [];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch khám của tôi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tuần 26/05 – 01/06/2026</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50">
            ← Tuần trước
          </button>
          <button className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50">
            Tuần sau →
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((d, i) => {
          const count = (mySchedule[String(i)] || []).length;
          return (
            <button key={d} onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${selectedDay === i ? 'border-green-500 bg-green-600 text-white shadow-md' : 'border-gray-200 bg-white hover:border-green-300'}`}>
              <span className={`text-[10px] font-semibold ${selectedDay === i ? 'text-green-200' : 'text-gray-400'}`}>{d}</span>
              <span className="text-lg font-extrabold leading-tight">{WEEK_DATES[i].split('/')[0]}</span>
              {count > 0
                ? <span className={`text-[10px] font-bold mt-0.5 ${selectedDay === i ? 'text-green-200' : 'text-green-600'}`}>{count} ca</span>
                : <span className={`text-[10px] mt-0.5 ${selectedDay === i ? 'text-green-300' : 'text-gray-300'}`}>Nghỉ</span>
              }
            </button>
          );
        })}
      </div>

      {/* Slot list */}
      {slots.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{WEEK_DAYS[selectedDay]}, {WEEK_DATES[selectedDay]}</h2>
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">{slots.length} bệnh nhân</span>
          </div>
          <div className="divide-y divide-gray-50">
            {slots.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 ${s.status === 'current' ? 'bg-green-50' : 'hover:bg-gray-50'} transition-colors`}>
                <div className="text-center w-12 shrink-0">
                  <p className="text-sm font-extrabold text-gray-700">{s.time}</p>
                  <p className="text-[10px] text-gray-400">{s.room}</p>
                </div>
                <div className={`w-0.5 h-10 rounded-full shrink-0 ${STATUS_STYLE[s.status].dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{s.patient}</p>
                  <p className="text-xs text-gray-400">{s.type}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[s.status].cls}`}>
                  {STATUS_STYLE[s.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <div className="text-5xl mb-3">🏖️</div>
          <p className="font-semibold text-gray-600">Không có lịch khám ngày này</p>
        </div>
      )}
    </div>
  );
}
