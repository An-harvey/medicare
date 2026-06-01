import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const todayPatients = [
  { id: 1, name: 'Lê Văn Cường',   age: 45, time: '08:30', type: 'Tái khám',    status: 'done',    reason: 'Đau ngực, khó thở' },
  { id: 2, name: 'Phạm Thu Hà',    age: 32, time: '09:00', type: 'Lần đầu',     status: 'current', reason: 'Hồi hộp, tim đập nhanh' },
  { id: 3, name: 'Nguyễn Thị Mai', age: 58, time: '09:30', type: 'Tái khám',    status: 'waiting', reason: 'Kiểm tra sau điều trị' },
  { id: 4, name: 'Trần Minh Đức',  age: 67, time: '10:00', type: 'Lần đầu',     status: 'waiting', reason: 'Tăng huyết áp' },
  { id: 5, name: 'Hoàng Thị Lan',  age: 41, time: '10:30', type: 'Tái khám',    status: 'waiting', reason: 'Theo dõi nhịp tim' },
  { id: 6, name: 'Vũ Quang Huy',   age: 55, time: '14:00', type: 'Lần đầu',     status: 'waiting', reason: 'Đau tức ngực trái' },
];

const STATUS_STYLE = {
  done:    { label: 'Đã khám',   cls: 'bg-gray-100 text-gray-500' },
  current: { label: 'Đang khám', cls: 'bg-green-100 text-green-700 animate-pulse' },
  waiting: { label: 'Chờ',       cls: 'bg-yellow-100 text-yellow-700' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  const stats = [
    { icon: '👥', label: 'Bệnh nhân hôm nay', value: '6',  color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: '✅', label: 'Đã khám xong',       value: '1',  color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: '⏳', label: 'Đang chờ',           value: '4',  color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: '📋', label: 'Tổng tháng này',     value: '87', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">Thứ 3, 27/05/2026</p>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch khám hôm nay</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xin chào, <span className="font-semibold text-green-600">{user.name}</span></p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
            + Ghi chú bệnh nhân
          </button>
          <button className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            📤 Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Danh sách bệnh nhân */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Danh sách bệnh nhân</h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">{todayPatients.length} người</span>
          </div>
          <div className="divide-y divide-gray-50">
            {todayPatients.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left ${selected?.id === p.id ? 'bg-blue-50' : ''}`}>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.age} tuổi · {p.type} · {p.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-600">{p.time}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status].cls}`}>
                    {STATUS_STYLE[p.status].label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chi tiết bệnh nhân */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.age} tuổi · {selected.type}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 text-xs">Giờ khám</span>
                  <span className="font-semibold text-gray-700">{selected.time}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 text-xs">Lý do khám</span>
                  <span className="font-semibold text-gray-700 text-right max-w-[60%]">{selected.reason}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 text-xs">Trạng thái</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status].cls}`}>
                    {STATUS_STYLE[selected.status].label}
                  </span>
                </div>
              </div>
              <textarea placeholder="Ghi chú / chẩn đoán..." rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" />
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                  ✓ Hoàn tất khám
                </button>
                <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  📋 Kê đơn
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm font-medium">Chọn bệnh nhân để xem chi tiết</p>
            </div>
          )}

          {/* Lịch tuần */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Lịch tuần này</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => (
                <div key={d} className={`py-2 rounded-lg font-semibold ${i === 1 ? 'bg-green-600 text-white' : 'text-gray-400'}`}>
                  <div>{d}</div>
                  <div className="font-bold mt-0.5">{26 + i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
