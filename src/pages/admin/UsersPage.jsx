/**
 * UsersPage — Quản lý người dùng
 * ──────────────────────────────
 * Role : ADMIN
 * API  :
 *   GET  /api/admin/users?keyword=&roleId=&page=0&size=10 → Page<UserResponseDTO>
 *   POST /api/admin/users                                  → String (201)
 *   PUT  /api/admin/users/{id}/status?isActive=            → String
 *
 * UserResponseDTO: { id, email, fullName, phone, cccd, isActive, roleId, roleName }
 * roleName: PATIENT | DOCTOR | ADMIN | STAFF
 */
import { useState, useEffect, useCallback } from 'react';
import { adminGetUsers, adminCreateUser, adminToggleUserStatus } from '../../api/admin';
import { useSpecialties } from '../../hooks/useCatalog';

// ── Map roleName → badge style ──
const ROLE_BADGE = {
  PATIENT: 'bg-blue-100 text-blue-700',
  DOCTOR:  'bg-green-100 text-green-700',
  ADMIN:   'bg-red-100 text-red-700',
  STAFF:   'bg-purple-100 text-purple-700',
};
const ROLE_LABEL = { PATIENT:'Bệnh nhân', DOCTOR:'Bác sĩ', ADMIN:'Admin', STAFF:'Lễ tân' };

// ── Role id mapping (theo DB) ──
const ROLE_OPTIONS = [
  { id: '',  label: 'Tất cả' },
  { id: 1,   label: 'Admin' },
  { id: 2,   label: 'Bác sĩ' },
  { id: 3,   label: 'Lễ tân / Nhân viên' },
  { id: 4,   label: 'Bệnh nhân' },
];

export default function UsersPage() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [totalElements,setTotal]        = useState(0);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [togglingId,   setTogglingId]   = useState(null);

  // ── ADMIN: lấy danh sách user từ API ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, keyword: search || undefined, roleId: roleFilter || undefined };
      const res = await adminGetUsers(params);
      // BE trả Page<UserResponseDTO>: { content, totalElements, totalPages, ... }
      setUsers(Array.isArray(res) ? res : res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch {
      setUsers([]); // lỗi: giữ rỗng
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── ADMIN: bật/tắt tài khoản ──
  const handleToggle = async (user) => {
    setTogglingId(user.id);
    try {
      await adminToggleUserStatus(user.id, !user.isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch { /* lỗi: bỏ qua */ }
    finally { setTogglingId(null); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalElements} tài khoản trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          + Thêm tài khoản
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tìm tên, email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {ROLE_OPTIONS.map(r => (
            <button key={String(r.id)} onClick={() => { setRoleFilter(r.id); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === r.id ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bảng danh sách ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Người dùng</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Liên hệ</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center">
                <div className="w-6 h-6 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                      {u.fullName?.charAt(0) || u.email?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{u.fullName}</p>
                      <p className="text-xs text-gray-400 hidden sm:block">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{u.phone}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.roleName] || 'bg-gray-100 text-gray-600'}`}>
                    {ROLE_LABEL[u.roleName] || u.roleName}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    disabled={togglingId === u.id}
                    onClick={() => handleToggle(u)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      u.isActive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-green-200 text-green-600 hover:bg-green-50'
                    }`}>
                    {togglingId === u.id ? '...' : u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Hiển thị {users.length} / {totalElements} tài khoản</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">← Trước</button>
            <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg">{page + 1}</span>
            <button disabled={users.length < 10} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40">Sau →</button>
          </div>
        </div>
      </div>

      {/* ── Modal thêm tài khoản Doctor/Staff ── */}
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={fetchUsers} />}
    </div>
  );
}

// ── ADMIN: modal tạo tài khoản Doctor / Staff ──
function AddUserModal({ onClose, onCreated }) {
  const { data: specialties } = useSpecialties();
  const [form, setForm] = useState({
    fullName:'', email:'', phone:'', cccd:'', password:'', roleName:'DOCTOR', specialtyId:'',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminCreateUser({
        ...form,
        specialtyId: form.specialtyId ? Number(form.specialtyId) : null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Tạo tài khoản Doctor / Staff</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { name:'fullName', label:'Họ và tên *',    placeholder:'Nguyễn Văn A' },
            { name:'email',    label:'Email *',         placeholder:'doctor@medcare.vn' },
            { name:'phone',    label:'Số điện thoại',  placeholder:'0912 345 678' },
            { name:'cccd',     label:'CCCD',            placeholder:'012345678901' },
            { name:'password', label:'Mật khẩu *',      placeholder:'••••••••', type:'password' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input name={f.name} type={f.type || 'text'} required={f.label.includes('*')}
                value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
              <select name="roleName" value={form.roleName} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50">
                <option value="DOCTOR">Bác sĩ</option>
                <option value="STAFF">Lễ tân / Nhân viên</option>
              </select>
            </div>
            {form.roleName === 'DOCTOR' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Chuyên khoa *</label>
                <select name="specialtyId" value={form.specialtyId} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50">
                  <option value="">Chọn...</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
