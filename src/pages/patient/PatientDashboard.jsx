import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const myBookings = [
  { id: 1, doctor: 'PGS.TS. Nguyễn Văn An', specialty: 'Tim mạch', date: 'T3, 27/05/2026', time: '09:00', status: 'confirmed', fee: 350000 },
  { id: 2, doctor: 'TS.BS. Trần Thị Bình',  specialty: 'Thần kinh', date: 'T5, 29/05/2026', time: '14:30', status: 'pending',   fee: 300000 },
  { id: 3, doctor: 'GS.TS. Lê Minh Châu',   specialty: 'Xương khớp', date: 'T2, 02/06/2026', time: '08:30', status: 'confirmed', fee: 400000 },
];

const records = [
  { date: '10/04/2026', doctor: 'BS. Hoàng Văn Em', diagnosis: 'Viêm da cơ địa', prescription: 'Cetirizine 10mg, Hydrocortisone cream' },
  { date: '15/03/2026', doctor: 'TS.BS. Vũ Thị Phương', diagnosis: 'Cận thị độ 2.5', prescription: 'Kính cận, nhỏ mắt Systane' },
];

const STATUS = {
  confirmed: { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
  pending:   { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700' },
};

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Xin chào 👋</p>
        <h1 className="text-2xl font-extrabold">{user.name}</h1>
        <p className="text-blue-100 text-sm mt-1">Bạn có <strong className="text-white">2 lịch hẹn</strong> sắp tới trong tuần này</p>
        <Link to="/doctors"
          className="inline-flex items-center gap-2 mt-4 bg-white text-blue-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
          + Đặt lịch khám mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📅', label: 'Lịch hẹn sắp tới', value: '2',  color: 'text-blue-600' },
          { icon: '✅', label: 'Đã khám',           value: '8',  color: 'text-green-600' },
          { icon: '📋', label: 'Hồ sơ bệnh án',     value: '5',  color: 'text-purple-600' },
          { icon: '⭐', label: 'Đánh giá đã gửi',   value: '3',  color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch hẹn sắp tới */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Lịch hẹn sắp tới</h2>
            <Link to="/dashboard/bookings" className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg shrink-0">👨‍⚕️</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.doctor}</p>
                  <p className="text-xs text-gray-400">{b.specialty} · {b.date} · {b.time}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS[b.status].cls}`}>
                    {STATUS[b.status].label}
                  </span>
                  <p className="text-xs text-blue-600 font-semibold mt-1">{b.fee.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hồ sơ gần nhất */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Hồ sơ gần nhất</h2>
            <Link to="/dashboard/records" className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {records.map((r, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-xs text-gray-400 mb-1">{r.date}</p>
                <p className="font-semibold text-gray-800 text-sm">{r.diagnosis}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.doctor}</p>
                <p className="text-xs text-blue-600 mt-1 line-clamp-1">💊 {r.prescription}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <Link to="/doctors" className="text-xs text-blue-600 font-semibold hover:underline">
              + Đặt lịch tái khám
            </Link>
          </div>
        </div>
      </div>

      {/* Gợi ý bác sĩ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Bác sĩ được đề xuất cho bạn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'PGS.TS. Nguyễn Văn An', spec: 'Tim mạch', rating: 4.9, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=faces,top' },
            { name: 'TS.BS. Trần Thị Bình',  spec: 'Thần kinh', rating: 4.8, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=faces,top' },
            { name: 'ThS.BS. Phạm Thị Dung', spec: 'Nhi khoa',  rating: 4.7, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=80&h=80&fit=crop&crop=faces,top' },
          ].map((d) => (
            <div key={d.name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
              <img src={d.img} alt={d.name} className="w-12 h-12 rounded-xl object-cover object-top shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-xs truncate">{d.name}</p>
                <p className="text-[11px] text-blue-600">{d.spec}</p>
                <p className="text-[11px] text-yellow-500">★ {d.rating}</p>
              </div>
              <Link to={`/booking/${1}`} className="shrink-0 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-700">
                Đặt
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
