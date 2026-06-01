import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user.name, email: user.email || '', phone: user.phone || '',
    dob: '1990-05-15', gender: 'male', address: 'Hà Nội',
  });
  const [saved, setSaved] = useState(false);

  const handle = (e) => { setSaved(false); setForm(f => ({ ...f, [e.target.name]: e.target.value })); };
  const save = (e) => { e.preventDefault(); setSaved(true); };

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Thông tin cá nhân</h1>
        <p className="text-sm text-gray-400 mt-1">Cập nhật thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shrink-0">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <button className="mt-2 text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            Đổi ảnh đại diện
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'name',    label: 'Họ và tên',       type: 'text',  placeholder: 'Nguyễn Văn A' },
            { name: 'email',   label: 'Email',            type: 'email', placeholder: 'example@email.com' },
            { name: 'phone',   label: 'Số điện thoại',   type: 'text',  placeholder: '0912 345 678' },
            { name: 'dob',     label: 'Ngày sinh',        type: 'date',  placeholder: '' },
            { name: 'address', label: 'Địa chỉ',          type: 'text',  placeholder: 'Hà Nội' },
          ].map((f) => (
            <div key={f.name} className={f.name === 'address' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới tính</label>
            <div className="flex gap-2">
              {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'other', l: 'Khác' }].map(g => (
                <button key={g.v} type="button" onClick={() => setForm(f => ({ ...f, gender: g.v }))}
                  className={`flex-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${form.gender === g.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  {g.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Đổi mật khẩu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu'].map(l => (
              <div key={l}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{l}</label>
                <input type="password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            Lưu thay đổi
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">✓ Đã lưu thành công</span>}
        </div>
      </form>
    </div>
  );
}
