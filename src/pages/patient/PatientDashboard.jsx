/**
 * PatientDashboard — Tổng quan bệnh nhân
 * Role  : PATIENT
 * APIs  : GET /patient/appointments → AppointmentResponseDTO[]
 *         GET /patient/medical-records → MedicalRecordResponseDTO[]
 *
 * BE enum: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyAppointments, useMyMedicalRecords } from '../../hooks/useAppointments';
import { formatDate, formatTime } from '../../utils/formatters';

const STATUS = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700' },
  CHECK_IN:    { label: 'Đã check-in',  cls: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: 'Đang khám',    cls: 'bg-green-100 text-green-700' },
  COMPLETED:   { label: 'Đã khám',      cls: 'bg-gray-100 text-gray-600' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700' },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading: loadingAppts } = useMyAppointments();
  const { data: records,      loading: loadingRecs  } = useMyMedicalRecords();

  // Lịch hẹn sắp tới (chưa hoàn tất hoặc hủy)
  const upcoming = appointments
    .filter(a => ['PENDING','CONFIRMED','CHECK_IN','IN_PROGRESS'].includes(a.status))
    .slice(0, 3);

  // Hồ sơ gần nhất
  const recentRecords = records.slice(0, 3);

  const statCards = [
    { icon:'📅', label:'Lịch hẹn sắp tới', value: upcoming.length,                                    color:'text-blue-600',   bg:'bg-blue-50' },
    { icon:'✅', label:'Đã khám',           value: appointments.filter(a=>a.status==='COMPLETED').length, color:'text-green-600',  bg:'bg-green-50' },
    { icon:'📋', label:'Hồ sơ bệnh án',     value: records.length,                                    color:'text-purple-600', bg:'bg-purple-50' },
    { icon:'🚫', label:'Đã hủy',            value: appointments.filter(a=>a.status==='CANCELLED').length, color:'text-red-500',    bg:'bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Xin chào 👋</p>
        <h1 className="text-2xl font-extrabold">{user?.name || user?.email}</h1>
        <p className="text-blue-100 text-sm mt-1">
          Bạn có <strong className="text-white">{upcoming.length} lịch hẹn</strong> sắp tới
        </p>
        <Link to="/doctors"
          className="inline-flex items-center gap-2 mt-4 bg-white text-blue-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
          + Đặt lịch khám mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-2xl font-extrabold ${s.color}`}>
              {loadingAppts || loadingRecs ? '…' : s.value}
            </p>
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

          {loadingAppts ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">Chưa có lịch hẹn nào sắp tới</p>
              <Link to="/doctors" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Đặt lịch ngay</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map(b => {
                const st = STATUS[b.status] || { label: b.status, cls:'bg-gray-100 text-gray-500' };
                return (
                  <div key={b.appointmentId} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg shrink-0">👨‍⚕️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{b.doctorName}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(b.workDate)} · {formatTime(b.startTime)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-3 border-t border-gray-50">
            <Link to="/dashboard/bookings" className="text-xs text-blue-600 font-semibold hover:underline">
              + Đặt lịch mới
            </Link>
          </div>
        </div>

        {/* Hồ sơ gần nhất */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Hồ sơ gần nhất</h2>
            <Link to="/dashboard/records" className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</Link>
          </div>

          {loadingRecs ? (
            <div className="p-6 flex justify-center">
              <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentRecords.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">Chưa có hồ sơ bệnh án</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentRecords.map((r, i) => (
                <div key={r.medicalRecordId || i} className="px-5 py-4">
                  <p className="text-xs text-gray-400 mb-1">{r.appointmentDate || '—'}</p>
                  <p className="font-semibold text-gray-800 text-sm line-clamp-2">{r.clinicalDiagnosis}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.doctorName}</p>
                  {r.diagnosedDiseases?.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                      🔬 {r.diagnosedDiseases.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <Link to="/doctors" className="text-xs text-blue-600 font-semibold hover:underline">
              + Đặt lịch tái khám
            </Link>
          </div>
        </div>
      </div>

      {/* Gợi ý bác sĩ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Đặt lịch khám nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon:'❤️', label:'Tim mạch' },
            { icon:'🧠', label:'Thần kinh' },
            { icon:'🦴', label:'Xương khớp' },
            { icon:'👶', label:'Nhi khoa' },
          ].map(s => (
            <Link key={s.label} to="/doctors"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{s.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
