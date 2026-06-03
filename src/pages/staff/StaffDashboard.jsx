import { useState } from 'react';

const queue = [
  { id: 1, name: 'Đỗ Minh Khoa',    time: '08:00', doctor: 'PGS.TS. Nguyễn Văn An', service: 'Tim mạch',   status: 'checkin',  ticket: 'A001' },
  { id: 2, name: 'Phan Thị Linh',   time: '08:30', doctor: 'TS.BS. Trần Thị Bình',  service: 'Thần kinh',  status: 'waiting',  ticket: 'A002' },
  { id: 3, name: 'Hoàng Văn Quân',  time: '09:00', doctor: 'GS.TS. Lê Minh Châu',   service: 'Xương khớp', status: 'waiting',  ticket: 'A003' },
  { id: 4, name: 'Nguyễn Thị Hoa',  time: '09:30', doctor: 'ThS.BS. Phạm Thị Dung', service: 'Nhi khoa',   status: 'pending',  ticket: 'A004' },
  { id: 5, name: 'Trần Văn Bình',   time: '10:00', doctor: 'TS.BS. Vũ Thị Phương',  service: 'Mắt',        status: 'pending',  ticket: 'A005' },
  { id: 6, name: 'Lê Thị Thanh',    time: '10:30', doctor: 'BS.CKI. Hoàng Văn Em',  service: 'Da liễu',    status: 'pending',  ticket: 'A006' },
];

const STATUS = {
  checkin: { label: 'Đã check-in', cls: 'bg-green-100 text-green-700' },
  waiting: { label: 'Đang chờ',    cls: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Chưa đến',    cls: 'bg-gray-100 text-gray-500' },
  done:    { label: 'Hoàn tất',    cls: 'bg-purple-100 text-purple-700' },
};

const rooms = [
  { id: 'P101', doctor: 'PGS.TS. Nguyễn Văn An', spec: 'Tim mạch',   status: 'busy',  patient: 'Đỗ Minh Khoa' },
  { id: 'P102', doctor: 'TS.BS. Trần Thị Bình',  spec: 'Thần kinh',  status: 'free',  patient: null },
  { id: 'P103', doctor: 'GS.TS. Lê Minh Châu',   spec: 'Xương khớp', status: 'busy',  patient: 'Phan Thị Linh' },
  { id: 'P104', doctor: 'ThS.BS. Phạm Thị Dung', spec: 'Nhi khoa',   status: 'free',  patient: null },
];

export default function StaffDashboard() {
  const [queueData, setQueueData] = useState(queue);
  const [search, setSearch] = useState('');

  const handleCheckin = (id) => {
    setQueueData((prev) => prev.map((p) => p.id === id ? { ...p, status: 'checkin' } : p));
  };

  const filtered = queueData.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.ticket.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { icon: '✅', label: 'Đã check-in',   value: queueData.filter((p) => p.status === 'checkin').length, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: '⏳', label: 'Đang chờ',      value: queueData.filter((p) => p.status === 'waiting').length, color: 'text-blue-600',  bg: 'bg-blue-50' },
    { icon: '📋', label: 'Chưa đến',      value: queueData.filter((p) => p.status === 'pending').length, color: 'text-gray-600',  bg: 'bg-gray-100' },
    { icon: '🏥', label: 'Phòng trống',   value: rooms.filter((r) => r.status === 'free').length,        color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">Thứ 3, 27/05/2026</p>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý lễ tân</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hôm nay có <strong className="text-purple-600">{queueData.length} bệnh nhân</strong> đặt lịch</p>
        </div>
        <button className="bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors self-start">
          + Đặt lịch nhanh
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hàng chờ */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Hàng chờ hôm nay</h2>
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">{filtered.length} người</span>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm theo tên hoặc số thứ tự..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50" />
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center font-extrabold text-purple-700 text-sm shrink-0">
                  {p.ticket}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.time} · {p.service} · {p.doctor.split(' ').slice(-2).join(' ')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS[p.status].cls}`}>
                    {STATUS[p.status].label}
                  </span>
                  {p.status === 'pending' && (
                    <button onClick={() => handleCheckin(p.id)}
                      className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-purple-700 transition-colors">
                      Check-in
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trạng thái phòng khám */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">Trạng thái phòng khám</h2>
          <div className="space-y-3">
            {rooms.map((r) => (
              <div key={r.id} className={`p-4 rounded-xl border-2 ${r.status === 'busy' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">Phòng {r.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'busy' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {r.status === 'busy' ? '🔴 Đang khám' : '🟢 Trống'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium">{r.doctor.split('. ').pop()}</p>
                <p className="text-[11px] text-gray-400">{r.spec}</p>
                {r.patient && <p className="text-[11px] text-red-600 mt-1 font-medium">👤 {r.patient}</p>}
              </div>
            ))}
          </div>

          {/* Nhanh */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác nhanh</p>
            <button className="w-full bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
              📞 Gọi bệnh nhân tiếp theo
            </button>
            <button className="w-full border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              🖨️ In phiếu số thứ tự
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
