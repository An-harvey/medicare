import { useState } from 'react';

const BOOKINGS = [
  { id: '#BK001', patient: 'Nguyễn Văn A',   doctor: 'PGS.TS. Nguyễn Văn An', specialty: 'Tim mạch',   date: '27/05/2026', time: '09:00', status: 'confirmed', fee: 350000 },
  { id: '#BK002', patient: 'Trần Thị Bích',  doctor: 'TS.BS. Trần Thị Bình',  specialty: 'Thần kinh',  date: '27/05/2026', time: '10:30', status: 'pending',   fee: 300000 },
  { id: '#BK003', patient: 'Lê Minh Tuấn',   doctor: 'GS.TS. Lê Minh Châu',   specialty: 'Xương khớp', date: '27/05/2026', time: '08:30', status: 'confirmed', fee: 400000 },
  { id: '#BK004', patient: 'Phạm Thu Hà',    doctor: 'ThS.BS. Phạm Thị Dung', specialty: 'Nhi khoa',   date: '26/05/2026', time: '14:00', status: 'done',      fee: 250000 },
  { id: '#BK005', patient: 'Hoàng Văn Quân', doctor: 'TS.BS. Vũ Thị Phương',  specialty: 'Mắt',        date: '26/05/2026', time: '15:30', status: 'cancelled', fee: 280000 },
  { id: '#BK006', patient: 'Đỗ Minh Khoa',   doctor: 'BS.CKI. Hoàng Văn Em',  specialty: 'Da liễu',    date: '25/05/2026', time: '11:00', status: 'done',      fee: 220000 },
];

const STATUS = {
  confirmed: { label: 'Xác nhận', cls: 'bg-green-100 text-green-700' },
  pending:   { label: 'Chờ',      cls: 'bg-yellow-100 text-yellow-700' },
  done:      { label: 'Hoàn tất', cls: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Đã hủy',   cls: 'bg-red-100 text-red-700' },
};

export default function AllBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = BOOKINGS.filter(b => {
    const matchSearch = b.patient.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = filtered.reduce((s, b) => s + (b.status !== 'cancelled' ? b.fee : 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý lịch hẹn</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng cộng {BOOKINGS.length} lịch hẹn</p>
        </div>
        <button className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          📊 Xuất Excel
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <p className={`text-xl font-extrabold ${k === 'confirmed' ? 'text-green-600' : k === 'pending' ? 'text-yellow-600' : k === 'done' ? 'text-blue-600' : 'text-red-500'}`}>
              {BOOKINGS.filter(b => b.status === k).length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{v.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã lịch, tên bệnh nhân..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[['all','Tất cả'],['confirmed','Xác nhận'],['pending','Chờ'],['done','Hoàn tất'],['cancelled','Đã hủy']].map(([k,l]) => (
            <button key={k} onClick={() => setStatusFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === k ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Mã</th>
              <th className="px-5 py-3 text-left">Bệnh nhân</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Bác sĩ</th>
              <th className="px-5 py-3 text-left hidden sm:table-cell">Ngày · Giờ</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-right">Phí</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{b.id}</td>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{b.patient}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{b.doctor}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">{b.date} · {b.time}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS[b.status].cls}`}>
                    {STATUS[b.status].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-blue-600 text-xs">
                  {b.status === 'cancelled' ? <span className="text-gray-300 line-through">{b.fee.toLocaleString('vi-VN')}đ</span> : `${b.fee.toLocaleString('vi-VN')}đ`}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 text-xs">✏️</button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-100">
            <tr>
              <td colSpan={5} className="px-5 py-3 text-xs text-gray-400">
                Hiển thị {filtered.length} / {BOOKINGS.length} lịch hẹn
              </td>
              <td className="px-5 py-3 text-right font-extrabold text-blue-700 text-sm">
                {total.toLocaleString('vi-VN')}đ
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
