const MONTHLY = [
  { month:'T1/2026', bookings:210, done:198, cancelled:12, revenue:85.5,  newUsers:45 },
  { month:'T2/2026', bookings:245, done:231, cancelled:14, revenue:92.3,  newUsers:52 },
  { month:'T3/2026', bookings:198, done:185, cancelled:13, revenue:78.1,  newUsers:38 },
  { month:'T4/2026', bookings:289, done:271, cancelled:18, revenue:110.4, newUsers:67 },
  { month:'T5/2026', bookings:334, done:315, cancelled:19, revenue:128.5, newUsers:78 },
];

const BY_SPECIALTY = [
  { name:'Tim mạch',   bookings:38, revenue:13.3, avgRating:4.9, color:'bg-red-400',    light:'bg-red-50 text-red-700' },
  { name:'Xương khớp', bookings:42, revenue:16.8, avgRating:4.9, color:'bg-blue-400',   light:'bg-blue-50 text-blue-700' },
  { name:'Thần kinh',  bookings:31, revenue:9.3,  avgRating:4.8, color:'bg-purple-400', light:'bg-purple-50 text-purple-700' },
  { name:'Nhi khoa',   bookings:28, revenue:7.0,  avgRating:4.7, color:'bg-yellow-400', light:'bg-yellow-50 text-yellow-700' },
  { name:'Mắt',        bookings:35, revenue:9.8,  avgRating:4.8, color:'bg-pink-400',   light:'bg-pink-50 text-pink-700' },
  { name:'Da liễu',    bookings:22, revenue:4.8,  avgRating:4.6, color:'bg-green-400',  light:'bg-green-50 text-green-700' },
];

const maxBookings = Math.max(...MONTHLY.map(m => m.bookings));

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Báo cáo thống kê</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng hợp hoạt động phòng khám – 5 tháng đầu năm 2026</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
            <option>5 tháng đầu 2026</option>
            <option>Quý 1/2026</option>
            <option>Năm 2025</option>
          </select>
          <button className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
            📤 Xuất PDF
          </button>
        </div>
      </div>

      {/* KPI tổng */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label:'Tổng lịch hẹn',    value:'1,276', color:'text-blue-600',   bg:'bg-blue-50' },
          { label:'Đã hoàn thành',    value:'1,200', color:'text-green-600',  bg:'bg-green-50' },
          { label:'Đã hủy',           value:'76',    color:'text-red-500',    bg:'bg-red-50' },
          { label:'Tổng doanh thu',   value:'494M',  color:'text-orange-600', bg:'bg-orange-50' },
          { label:'Người dùng mới',   value:'280',   color:'text-purple-600', bg:'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart lịch hẹn theo tháng */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-6">Lịch hẹn theo tháng</h2>
        <div className="flex items-end gap-4 h-44">
          {MONTHLY.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-semibold">{m.bookings}</span>
              <div className="w-full flex flex-col gap-0.5">
                <div className="w-full rounded-t-lg bg-green-400"
                  style={{ height: `${(m.done / maxBookings) * 140}px` }} />
                <div className="w-full bg-red-300"
                  style={{ height: `${(m.cancelled / maxBookings) * 140}px` }} />
              </div>
              <span className="text-[10px] text-gray-400">{m.month.replace('/2026','')}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400 rounded-sm"></span>Hoàn thành</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-300 rounded-sm"></span>Đã hủy</span>
        </div>
      </div>

      {/* Bảng chi tiết tháng */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Chi tiết theo tháng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Tháng</th>
                <th className="px-5 py-3 text-right">Tổng lịch</th>
                <th className="px-5 py-3 text-right">Hoàn thành</th>
                <th className="px-5 py-3 text-right">Đã hủy</th>
                <th className="px-5 py-3 text-right">Tỷ lệ HT</th>
                <th className="px-5 py-3 text-right">Doanh thu</th>
                <th className="px-5 py-3 text-right">User mới</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MONTHLY.map(m => (
                <tr key={m.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{m.month}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{m.bookings}</td>
                  <td className="px-5 py-3.5 text-right text-green-600 font-semibold">{m.done}</td>
                  <td className="px-5 py-3.5 text-right text-red-500">{m.cancelled}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs font-bold text-green-600">
                      {Math.round(m.done/m.bookings*100)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-blue-600">{m.revenue}M đ</td>
                  <td className="px-5 py-3.5 text-right text-purple-600 font-semibold">+{m.newUsers}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-5 py-3 font-extrabold text-gray-800">Tổng cộng</td>
                <td className="px-5 py-3 text-right font-extrabold text-gray-800">1,276</td>
                <td className="px-5 py-3 text-right font-extrabold text-green-600">1,200</td>
                <td className="px-5 py-3 text-right font-extrabold text-red-500">76</td>
                <td className="px-5 py-3 text-right font-extrabold text-green-600">94.1%</td>
                <td className="px-5 py-3 text-right font-extrabold text-blue-700">494.8M đ</td>
                <td className="px-5 py-3 text-right font-extrabold text-purple-600">+280</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Theo chuyên khoa */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5">Hiệu suất theo chuyên khoa – Tháng 5/2026</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BY_SPECIALTY.map(s => (
            <div key={s.name} className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.light}`}>{s.name}</span>
                <span className="text-yellow-500 text-xs font-bold">★ {s.avgRating}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xl font-extrabold text-gray-800">{s.bookings}</p>
                  <p className="text-[10px] text-gray-400">Ca khám</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-blue-600">{s.revenue}M</p>
                  <p className="text-[10px] text-gray-400">Doanh thu</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`}
                  style={{ width: `${(s.bookings/42)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
