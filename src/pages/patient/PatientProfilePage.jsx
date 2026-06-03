/**
 * ProfilePage — Thông tin cá nhân
 * ─────────────────────────────────
 * Role PATIENT:
 *   GET  /api/patient/profile  → PatientProfileResponseDTO
 *   POST /api/patient/profile  → multipart (data + avatarFile)
 *   Fields: dob, bloodType, allergyHistory, personalMedicalHistory, familyMedicalHistory, imageUrl
 *
 * Role DOCTOR:
 *   PUT  /api/doctor/profile   → multipart (dto + avatarFile)
 *   Fields cho phép sửa: imageUrl, expertiseDescription, biography
 *   Fields KHÓA (chỉ đọc): academicTitle, degree, experienceYears (do Admin quản lý)
 *
 * Các role khác (ADMIN, STAFF): chỉnh sửa thông tin cơ bản (UI only, chưa có BE endpoint riêng)
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientProfile, updatePatientProfile } from '../../api/patient';
import { updateDoctorProfile }                     from '../../api/doctor';
import { getImageUrl } from '../../utils/constants';

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();

  // ── State form cơ bản (dùng cho mọi role) ──
  const [base, setBase] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  // ── State riêng cho PATIENT ──
  const [patient, setPatient] = useState({
    dob: '', bloodType: '', allergyHistory: '', personalMedicalHistory: '', familyMedicalHistory: '',
  });

  // ── State riêng cho DOCTOR (chỉ sửa được 3 field) ──
  const [doctor, setDoctor] = useState({ expertiseDescription: '', biography: '' });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState('');
  const fileRef = useRef(null);

  const isPatient = user?.role === 'user';
  const isDoctor  = user?.role === 'doctor';

  // ── PATIENT: load profile từ API khi mount ──
  useEffect(() => {
    if (!isPatient) return;
    getPatientProfile()
      .then(res => {
        setBase(f => ({ ...f, name: res.fullName || f.name, email: res.email || f.email, phone: res.phone || f.phone }));
        setPatient({
          dob:                    res.dob                    || '',
          bloodType:              res.bloodType              || '',
          allergyHistory:         res.allergyHistory         || '',
          personalMedicalHistory: res.personalMedicalHistory || '',
          familyMedicalHistory:   res.familyMedicalHistory   || '',
        });
        if (res.imageUrl) setAvatarPreview(getImageUrl(res.imageUrl));
        if (res.fullName) setBase(f => ({ ...f, name: res.fullName, email: res.email || f.email, phone: res.phone || f.phone }));
      })
      .catch(() => {}); // fallback context data
  }, [isPatient]);

  // ── Xử lý chọn file ảnh ──
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Submit ──
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError('');
    try {
      if (isPatient) {
        // ── PATIENT: update profile ──
        const res = await updatePatientProfile(patient, avatarFile);
        if (res.imageUrl) updateLocalUser({ avatarUrl: getImageUrl(res.imageUrl) });
      } else if (isDoctor) {
        // ── DOCTOR: update profile (chỉ expertiseDescription, biography, imageUrl) ──
        const res = await updateDoctorProfile({ ...doctor, imageUrl: user?.avatarUrl }, avatarFile);
        if (res.imageUrl) updateLocalUser({ avatarUrl: getImageUrl(res.imageUrl) });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Thông tin cá nhân</h1>
        <p className="text-sm text-gray-400 mt-1">Cập nhật thông tin tài khoản của bạn</p>
      </div>

      {/* ── Avatar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-100 shrink-0">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-blue-600 text-3xl font-extrabold">{user?.name?.charAt(0)}</div>
            }
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700 shadow">
            ✏️
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-bold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1.5 text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{user?.label}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* ── Thông tin cơ bản (mọi role) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name:'name',  label:'Họ và tên', placeholder:'Nguyễn Văn A', state: base, setState: setBase },
              { name:'email', label:'Email',      placeholder:'example@email.com', state: base, setState: setBase, disabled: true },
              { name:'phone', label:'Số điện thoại', placeholder:'0912 345 678', state: base, setState: setBase },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input value={f.state[f.name]} disabled={f.disabled}
                  onChange={e => f.setState(s => ({ ...s, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${f.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* ── PATIENT: Hồ sơ y tế ── */}
        {isPatient && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Hồ sơ y tế</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày sinh</label>
                <input type="date" value={patient.dob} onChange={e => setPatient(p => ({ ...p, dob: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nhóm máu</label>
                <select value={patient.bloodType} onChange={e => setPatient(p => ({ ...p, bloodType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                  <option value="">Chọn nhóm máu</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            {[
              { key:'allergyHistory',         label:'Tiền sử dị ứng' },
              { key:'personalMedicalHistory', label:'Tiền sử bệnh cá nhân' },
              { key:'familyMedicalHistory',   label:'Tiền sử bệnh gia đình' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <textarea value={patient[f.key]} rows={2}
                  onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="Nhập nếu có..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 resize-none" />
              </div>
            ))}
          </div>
        )}

        {/* ── DOCTOR: Hồ sơ chuyên môn ── */}
        {isDoctor && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Hồ sơ chuyên môn</h2>
            {/* Fields khóa — chỉ Admin được sửa */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">🔒 Chỉ Admin được chỉnh sửa</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {user?.academicTitle && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">Học hàm: {user.academicTitle}</span>}
                {user?.degree        && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">Học vị: {user.degree}</span>}
                {user?.experienceYears && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg">Kinh nghiệm: {user.experienceYears} năm</span>}
              </div>
            </div>
            {[
              { key:'expertiseDescription', label:'Thế mạnh chuyên sâu', rows: 3, placeholder:'Mô tả các lĩnh vực chuyên sâu...' },
              { key:'biography',            label:'Tiểu sử làm việc',    rows: 4, placeholder:'Kinh nghiệm công tác, thành tích nổi bật...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <textarea value={doctor[f.key]} rows={f.rows} placeholder={f.placeholder}
                  onChange={e => setDoctor(d => ({ ...d, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50 resize-none" />
              </div>
            ))}
          </div>
        )}

        {/* Thông báo & nút lưu */}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">⚠️ {error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Lưu thay đổi
          </button>
          {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1">✓ Đã lưu thành công</span>}
        </div>
      </form>
    </div>
  );
}
