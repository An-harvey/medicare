import { useState } from 'react';

const patients = [
  { id: 1, name: 'Lê Văn Cường',   age: 45, gender: 'Nam', phone: '0912 111 222', lastVisit: '27/05/2026', visits: 5,  diagnosis: 'Tăng huyết áp', status: 'active' },
  { id: 2, name: 'Phạm Thu Hà',    age: 32, gender: 'Nữ',  phone: '0923 333 444', lastVisit: '27/05/2026', visits: 1,  diagnosis: 'Hồi hộp, tim đập nhanh', status: 'new' },
  { id: 3, name: 'Nguyễn Thị Mai', age: 58, gender: 'Nữ',  phone: '0934 555 666', lastVisit: '20/05/2026', visits: 12, diagnosis: 'Suy tim độ 2', status: 'active' },
  { id: 4, name: 'Trần Minh Đức',  age: 67, gender: 'Nam', phone: '0945 777 888', lastVisit: '15/05/2026', visits: 3,  diagnosis: 'Tăng huyết áp giai đoạn 1', status: 'active' },
  { id: 5, name: 'Hoàng Thị Lan',  age: 41, gender: 'Nữ',  phone: '0956 999 000', lastVisit: '10/05/2026', visits: 7,  diagnosis: 'Rối loạn nhịp tim', status: 'active' },
];

const STATUS = {
  new:    { label: 'Mới',         cls: 'bg-blue-100 text-blue-700' },
  active: { label: 'Đang điều trị', cls: 'bg-green-100 text-green-700' },
  done:   { label: 'Hoàn tất',    cls: 'bg-gray-100 text-gray-500' },
};

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh sách bệnh nhân</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tổng cộng {patients.length} bệnh nhân</p>
        </div>
        <button className="bg-green-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
          + Thêm bệnh nhân
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Bệnh nhân</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Liên hệ</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Lần cuối</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === p.id ? 'bg-green-50' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.age} tuổi · {p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden sm:table-cell">{p.phone}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell">{p.lastVisit}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS[p.status].cls}`}>
                      {STATUS[p.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-extrabold text-lg">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.age} tuổi · {selected.gender}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                ['Điện thoại', selected.phone],
                ['Số lần khám', `${selected.visits} lần`],
                ['Lần khám cuối', selected.lastVisit],
                ['Chẩn đoán gần nhất', selected.diagnosis],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-gray-50 text-xs">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-semibold text-gray-700 text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                📋 Xem hồ sơ
              </button>
              <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                📅 Đặt lịch
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">👆</div>
            <p className="text-sm">Chọn bệnh nhân để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
