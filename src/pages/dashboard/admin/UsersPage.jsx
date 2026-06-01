import { useState } from 'react';

const USERS = [
  { id: 1, name: 'Nguyễn Văn A',  email: 'user@medcare.vn',   phone: '0912 111 222', role: 'user',   joined: '01/01/2026', bookings: 8,  status: 'active' },
  { id: 2, name: 'Trần Thị Bích', email: 'bich@gmail.com',    phone: '0923 333 444', role: 'user',   joined: '15/02/2026', bookings: 3,  status: 'active' },
  { id: 3, name: 'Lê Minh Tuấn',  email: 'tuan@gmail.com',    phone: '0934 555 666', role: 'user',   joined: '20/03/2026', bookings: 1,  status: 'active' },
  { id: 4, name: 'Lê Thị Hoa',    email: 'staff@medcare.vn',  phone: '0945 777 888', role: 'staff',  joined: '01/01/2025', bookings: 0,  status: 'active' },
  { id: 5, name: 'Admin MedCare', email: 'admin@medcare.vn',  phone: '0956 999 000', role: 'admin',  joined: '01/01/2024', bookings: 0,  status: 'active' },
  { id: 6, name: 'BS. Trần Thị Bình', email: 'doctor@medcare.vn', phone: '0967 000 111', role: 'doctor', joined: '01/06/2025', bookings: 0, status: 'active' },
];

const ROLE_BADGE = {
  user:   'bg-blue-100 text-blue-700',
  doctor: 'bg-green-100 text-green-700',
  admin:  'bg-red-100 text-red-700',
  staff:  'bg-purple-100 text-purple-700',
};
const ROLE_LABEL = { user: 'Người dùng', doctor: 'Bác sĩ', admin: 'Admin', staff: 'Lễ tân' };

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-400 mt-0.5">{USERS.length} tài khoản trong hệ thống</p>
        </div>
        <button className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          + Thêm tài khoản
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {['all', 'user', 'doctor', 'staff', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === r ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500'}`}>
              {r === 'all' ? 'Tất cả' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Người dùng</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Liên hệ</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left hidden sm:table-cell">Ngày tham gia</th>
              <th className="px-5 py-3 text-center hidden lg:table-cell">Lịch hẹn</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{u.phone}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">{u.joined}</td>
                <td className="px-5 py-3.5 text-center text-gray-600 font-semibold text-xs hidden lg:table-cell">{u.bookings}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 text-xs transition-colors">✏️</button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs transition-colors">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {filtered.length} / {USERS.length} tài khoản</span>
          <div className="flex gap-1">
            {[1,2,3].map(p => (
              <button key={p} className={`w-7 h-7 rounded-lg font-semibold ${p === 1 ? 'bg-slate-800 text-white' : 'hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
