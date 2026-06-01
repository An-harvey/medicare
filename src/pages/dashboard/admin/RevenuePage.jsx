const monthly = [
  { month: 'Tháng 1', bookings: 210, revenue: 85.5,  growth: '+5%' },
  { month: 'Tháng 2', bookings: 245, revenue: 92.3,  growth: '+8%' },
  { month: 'Tháng 3', bookings: 198, revenue: 78.1,  growth: '-15%' },
  { month: 'Tháng 4', bookings: 289, revenue: 110.4, growth: '+41%' },
  { month: 'Tháng 5', bookings: 334, revenue: 128.5, growth: '+16%' },
];

const bySpecialty = [
  { name: 'Tim mạch',   revenue: 42.5, pct: 33, color: 'bg-red-400' },
  { name: 'Xương khớp', revenue: 28.3, pct: 22, color: 'bg-blue-400' },
  { name: 'Thần kinh',  revenue: 21.6, pct: 17, color: 'bg-purple-400' },
  { name: 'Nhi khoa',   revenue: 18.2, pct: 14, color: 'bg-yellow-400' },
  { name: 'Khác',       revenue: 17.9, pct: 14, color: 'bg-gray-300' },
];

export default function RevenuePage() {
  const maxRev = Math.max(...monthly.map(m => m.revenue));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Báo cáo doanh thu</h1>
        <p className="text-sm text-gray-400 mt-0.5">Thống kê doanh thu theo tháng – năm 2026</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu tháng 5', value: '128.5M', delta: '+16%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Tổng lịch hẹn',     value: '1,276',  delta: '+22%', color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Doanh thu TB/ca',   value: '308K',   delta: '+3%',  color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Tỷ lệ hoàn thành', value: '94.2%',  delta: '+1%',  color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-green-600 font-semibold mt-1">{s.delta} so với tháng trước</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800">Doanh thu theo tháng</h2>
            <span className="text-xs text-gray-400">Đơn vị: triệu đồng</span>
          </div>
          <div className="flex items-end gap-4 h-44">
            {monthly.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-gray-600">{m.revenue}</span>
                <div className="w-full rounded-t-xl transition-all"
                  style={{ height: `${(m.revenue / maxRev) * 100}%`, background: m.month === 'Tháng 5' ? '#2563eb' : '#bfdbfe' }} />
                <span className="text-[10px] text-gray-400 text-center leading-tight">{m.month.replace('Tháng ', 'T')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By specialty */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5">Theo chuyên khoa</h2>
          <div className="space-y-4">
            {bySpecialty.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{s.name}</span>
                  <span className="text-gray-400">{s.revenue}M · {s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Chi tiết theo tháng</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Tháng</th>
              <th className="px-5 py-3 text-right">Lịch hẹn</th>
              <th className="px-5 py-3 text-right">Doanh thu</th>
              <th className="px-5 py-3 text-right">Tăng trưởng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {monthly.map(m => (
              <tr key={m.month} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-gray-800">{m.month}</td>
                <td className="px-5 py-3.5 text-right text-gray-600">{m.bookings}</td>
                <td className="px-5 py-3.5 text-right font-bold text-blue-600">{m.revenue}M đ</td>
                <td className={`px-5 py-3.5 text-right font-bold text-xs ${m.growth.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {m.growth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
