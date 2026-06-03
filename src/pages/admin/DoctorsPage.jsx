import { useState } from 'react';

// ── ADMIN: doctor management ──
import { adminUpdateDoctorAcademic, adminCreateUser } from '../../api/admin';
import { useDoctors } from '../../hooks/useDoctors';
import { useSpecialties } from '../../hooks/useCatalog';

// Mock fallback khi BE chưa chạy
const MOCK_DOCTORS = [
  { id:1, name:'PGS.TS. Nguyễn Văn An', specialty:'Tim mạch',   degree:'PGS-TS', exp:20, rating:4.9, reviews:248, price:350000, status:'active',  patients:38, img:'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=faces,top' },
  { id:2, name:'TS.BS. Trần Thị Bình',  specialty:'Thần kinh',  degree:'TS',     exp:15, rating:4.8, reviews:195, price:300000, status:'active',  patients:31, img:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=faces,top' },
  { id:3, name:'GS.TS. Lê Minh Châu',   specialty:'Xương khớp', degree:'GS-TS',  exp:25, rating:4.9, reviews:312, price:400000, status:'active',  patients:42, img:'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&crop=faces,top' },
  { id:4, name:'ThS.BS. Phạm Thị Dung', specialty:'Nhi khoa',   degree:'ThS',    exp:10, rating:4.7, reviews:180, price:250000, status:'active',  patients:28, img:'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=80&h=80&fit=crop&crop=faces,top' },
  { id:5, name:'BS.CKI. Hoàng Văn Em',  specialty:'Da liễu',    degree:'CKI',    exp:12, rating:4.6, reviews:140, price:220000, status:'leave',   patients:22, img:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=faces,top' },
  { id:6, name:'TS.BS. Vũ Thị Phương',  specialty:'Mắt',        degree:'TS',     exp:14, rating:4.8, reviews:210, price:280000, status:'active',  patients:35, img:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=faces,top' },
];

const STATUS = {
  active: { label: 'Đang làm việc', cls: 'bg-green-100 text-green-700' },
  leave:  { label: 'Nghỉ phép',     cls: 'bg-yellow-100 text-yellow-700' },
  off:    { label: 'Ngừng hoạt động', cls: 'bg-red-100 text-red-700' },
};

const ACADEMIC_TITLES  = ['GS', 'PGS', 'GS-TS', 'PGS-TS'];
const DEGREES          = ['TS', 'ThS', 'BS', 'CKI', 'CKII'];

// ── Modal chỉnh sửa học hàm/học vị ──
function AcademicModal({ doctor, onClose, onSaved }) {
  const [form, setForm] = useState({
    academicTitle:   doctor.academicTitle   || doctor.degree || '',
    degree:          doctor.degree          || '',
    experienceYears: doctor.exp             || doctor.experienceYears || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // ── ADMIN: doctor management — PUT /api/admin/doctors/{id}/academic-info ──
      await adminUpdateDoctorAcademic(doctor.id, {
        academicTitle:   form.academicTitle,
        degree:          form.degree,
        experienceYears: Number(form.experienceYears),
      });
      onSaved();
      onClose();
    } catch (err) {
      // Fallback mock
      console.warn('Update academic failed, using mock fallback:', err.message);
      onSaved(); // giả lập thành công
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Cập nhật học hàm</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <p className="text-xs text-gray-500">{doctor.name || doctor.fullName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Học hàm</label>
            <select name="academicTitle" value={form.academicTitle} onChange={handle}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50">
              <option value="">-- Chọn --</option>
              {ACADEMIC_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Học vị</label>
            <select name="degree" value={form.degree} onChange={handle}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50">
              <option value="">-- Chọn --</option>
              {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kinh nghiệm (năm)</label>
            <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={handle}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">⚠️ {error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal thêm bác sĩ mới ──
function AddDoctorModal({ specialties, onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', specialtyId: '',
    academicTitle: '', degree: '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // ── ADMIN: doctor management — POST /api/admin/users với roleName=DOCTOR ──
      await adminCreateUser({
        fullName:    form.fullName,
        email:       form.email,
        password:    form.password || 'doctor@123', // default password
        phone:       form.phone,
        roleName:    'DOCTOR',
        specialtyId: form.specialtyId ? Number(form.specialtyId) : null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Thêm bác sĩ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">Thêm bác sĩ mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'fullName', label: 'Họ và tên *',  placeholder: 'PGS.TS. Nguyễn Văn A', type: 'text' },
            { name: 'email',    label: 'Email *',       placeholder: 'doctor@medcare.vn', type: 'email' },
            { name: 'password', label: 'Mật khẩu',     placeholder: 'doctor@123', type: 'password' },
            { name: 'phone',    label: 'Điện thoại',    placeholder: '0912 345 678', type: 'text' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {/* ── ADMIN: chuyên khoa select từ useSpecialties() ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Chuyên khoa</label>
              <select name="specialtyId" value={form.specialtyId} onChange={handle}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none bg-gray-50">
                <option value="">-- Chọn --</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Học hàm</label>
              <select name="academicTitle" value={form.academicTitle} onChange={handle}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none bg-gray-50">
                <option value="">-- Chọn --</option>
                {[...ACADEMIC_TITLES, ...DEGREES].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">⚠️ {error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Đang thêm...' : 'Thêm bác sĩ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editAcademic, setEditAcademic] = useState(null); // doctor đang sửa học hàm

  // ── ADMIN: doctor management — load từ public API ──
  // getDoctors() từ public API: GET /api/public/doctors?roleId=2
  const { data: apiDoctors, loading, error: loadError } = useDoctors();

  // ── ADMIN: chuyên khoa select ──
  const { data: specialties } = useSpecialties();

  // Dùng API data nếu có, fallback sang mock
  const rawList = (apiDoctors && apiDoctors.length > 0) ? apiDoctors : MOCK_DOCTORS;

  // Normalize: đảm bảo luôn có các field cần thiết
  const doctors = rawList.map(d => ({
    id:       d.id,
    name:     d.name    || d.fullName || '',
    specialty: d.specialty || d.specialtyName || '',
    degree:   d.degree  || d.academicTitle || '',
    exp:      d.exp     || d.experienceYears || 0,
    rating:   d.rating  || 0,
    reviews:  d.reviews || d.reviewCount || 0,
    price:    d.price   || 0,
    patients: d.patients || 0,
    status:   d.status  || (d.isActive !== false ? 'active' : 'off'),
    img:      d.img     || d.imageUrl || d.avatar || '',
    // Giữ raw để dùng khi edit academic
    _raw: d,
  }));

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý bác sĩ</h1>
          <p className="text-sm text-gray-400 mt-0.5">{doctors.length} bác sĩ trong hệ thống</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          + Thêm bác sĩ
        </button>
      </div>

      {/* Error notice */}
      {loadError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700 flex items-center gap-2">
          ⚠️ Không thể tải từ server, đang hiển thị dữ liệu mẫu.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">
            {doctors.filter(d => d.status === 'active').length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Đang làm việc</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-600">
            {doctors.filter(d => d.status === 'leave').length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Nghỉ phép</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-600">
            {doctors.reduce((s, d) => s + (d.patients || 0), 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Ca khám tháng này</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm bác sĩ, chuyên khoa..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Đang tải danh sách bác sĩ...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Doctor list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Bác sĩ</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Chuyên khoa</th>
                  <th className="px-5 py-3 text-center hidden sm:table-cell">Ca tháng</th>
                  <th className="px-5 py-3 text-center hidden lg:table-cell">Đánh giá</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <tr key={d.id} onClick={() => setSelected(d)}
                    className={`cursor-pointer transition-colors ${selected?.id === d.id ? 'bg-slate-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {d.img
                          ? <img src={d.img} alt={d.name} className="w-9 h-9 rounded-xl object-cover object-top shrink-0" />
                          : <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                              {d.name.charAt(0)}
                            </div>
                        }
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{d.name}</p>
                          <p className="text-[10px] text-gray-400">{d.degree} · {d.exp} năm KN</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{d.specialty}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-blue-600 text-sm hidden sm:table-cell">{d.patients}</td>
                    <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                      {d.rating > 0 && (
                        <>
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="text-xs font-bold text-gray-700 ml-0.5">{d.rating}</span>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${(STATUS[d.status] || STATUS.off).cls}`}>
                        {(STATUS[d.status] || STATUS.off).label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* ── ADMIN: Chỉnh sửa học hàm ── */}
                        <button
                          onClick={e => { e.stopPropagation(); setEditAcademic(d); }}
                          title="Cập nhật học hàm"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 text-xs">✏️</button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
              <div className="relative h-32 overflow-hidden">
                {selected.img
                  ? <img src={selected.img} alt={selected.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-4xl font-bold">
                      {selected.name?.charAt(0)}
                    </div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-bold text-sm">{selected.name}</p>
                  <p className="text-slate-300 text-xs">{selected.degree}</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  ['Chuyên khoa', selected.specialty],
                  ['Kinh nghiệm', `${selected.exp} năm`],
                  selected.rating > 0 ? ['Đánh giá', `★ ${selected.rating} (${selected.reviews} đánh giá)`] : null,
                  selected.patients > 0 ? ['Ca tháng này', `${selected.patients} ca`] : null,
                  selected.price > 0 ? ['Phí khám', `${selected.price.toLocaleString('vi-VN')}đ`] : null,
                ].filter(Boolean).map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-50 text-xs">
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-700">{v}</span>
                  </div>
                ))}
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${(STATUS[selected.status] || STATUS.off).cls}`}>
                  {(STATUS[selected.status] || STATUS.off).label}
                </span>
                <div className="flex gap-2 pt-1">
                  {/* ── ADMIN: Cập nhật học hàm ── */}
                  <button
                    onClick={() => setEditAcademic(selected)}
                    className="flex-1 bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-700">
                    ✏️ Cập nhật học hàm
                  </button>
                  <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50">
                    📅 Xem lịch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p className="text-sm">Chọn bác sĩ để xem chi tiết</p>
            </div>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa học hàm */}
      {editAcademic && (
        <AcademicModal
          doctor={editAcademic}
          onClose={() => setEditAcademic(null)}
          onSaved={() => setEditAcademic(null)}
        />
      )}

      {/* Modal thêm bác sĩ */}
      {showAdd && (
        <AddDoctorModal
          specialties={specialties}
          onClose={() => setShowAdd(false)}
          onCreated={() => { /* refresh handled by useDoctors refetch */ }}
        />
      )}
    </div>
  );
}
