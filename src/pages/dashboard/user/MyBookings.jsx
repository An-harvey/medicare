import { useState } from 'react';
import { Link } from 'react-router-dom';

const ALL = [
  { id: '#BK001', doctor: 'PGS.TS. Nguyễn Văn An', specialty: 'Tim mạch',   date: 'T3, 27/05/2026', time: '09:00', status: 'confirmed', fee: 350000, type: 'Lần đầu' },
  { id: '#BK002', doctor: 'TS.BS. Trần Thị Bình',  specialty: 'Thần kinh',  date: 'T5, 29/05/2026', time: '14:30', status: 'pending',   fee: 300000, type: 'Tái khám' },
  { id: '#BK003', doctor: 'GS.TS. Lê Minh Châu',   specialty: 'Xương khớp', date: 'T2, 02/06/2026', time: '08:30', status: 'confirmed', fee: 400000, type: 'Lần đầu' },
  { id: '#BK004', doctor: 'ThS.BS. Phạm Thị Dung', specialty: 'Nhi khoa',   date: 'T6, 10/04/2026', time: '10:00', status: 'done',      fee: 250000, type: 'Tái khám' },
  { id: '#BK005', doctor: 'BS.CKI. Hoàng Văn Em',  specialty: 'Da liễu',    date: 'T3, 15/03/2026', time: '15:00', status: 'cancelled', fee: 220000, type: 'Lần đầu' },
];

const STATUS = {
  confirmed: { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  pending:   { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  done:      { label: 'Đã khám',      cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  cancelled: { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
};

const TABS = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'upcoming',  label: 'Sắp tới' },
  { key: 'done',      label: 'Đã khám' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function MyBookings() {
  const [tab, setTab] = useState('all');
  const [detail, setDetail] = useState(null);

  const filtered = ALL.filter(b => {
    if (tab === 'upcoming')  return b.status === 'confirmed' || b.status === 'pending';
    if (tab === 'done')      return b.status === 'done';
    if (tab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch hẹn của tôi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý tất cả lịch khám đã đặt</p>
        </div>
        <Link to="/doctors"
          className="bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          + Đặt lịch mới
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {ALL.filter(b => t.key === 'all' ? true : t.key === 'upcoming' ? (b.status === 'confirmed' || b.status === 'pending') : b.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(b => (
            <button key={b.id} onClick={() => setDetail(b)}
              className={`w-full bg-white rounded-2xl border-2 p-4 text-left hover:shadow-md transition-all ${detail?.id === b.id ? 'border-blue-400' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">👨‍⚕️</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{b.doctor}</p>
                    <p className="text-xs text-gray-400">{b.specialty} · {b.type}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${STATUS[b.status].cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS[b.status].dot}`}></span>
                  {STATUS[b.status].label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                <span>📅 {b.date}</span>
                <span>⏰ {b.time}</span>
                <span className="ml-auto font-bold text-blue-600">{b.fee.toLocaleString('vi-VN')}đ</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">Không có lịch hẹn nào</p>
              <Link to="/doctors" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Đặt lịch ngay</Link>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {detail ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Chi tiết lịch hẹn</h3>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Mã lịch', detail.id],
                  ['Bác sĩ', detail.doctor],
                  ['Chuyên khoa', detail.specialty],
                  ['Ngày khám', detail.date],
                  ['Giờ khám', detail.time],
                  ['Loại khám', detail.type],
                  ['Phí khám', `${detail.fee.toLocaleString('vi-VN')}đ`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm py-2 border-b border-gray-50">
                    <span className="text-gray-400 text-xs">{l}</span>
                    <span className="font-semibold text-gray-700 text-xs text-right">{v}</span>
                  </div>
                ))}
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${STATUS[detail.status].cls}`}>
                <span className={`w-2 h-2 rounded-full ${STATUS[detail.status].dot}`}></span>
                {STATUS[detail.status].label}
              </span>
              {(detail.status === 'confirmed' || detail.status === 'pending') && (
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                    Hủy lịch
                  </button>
                  <button className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    Đổi lịch
                  </button>
                </div>
              )}
              {detail.status === 'done' && (
                <button className="w-full bg-yellow-400 text-yellow-900 text-xs font-bold py-2.5 rounded-xl hover:bg-yellow-500 transition-colors">
                  ⭐ Đánh giá bác sĩ
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm">Chọn lịch hẹn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
