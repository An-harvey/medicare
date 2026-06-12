/**
 * AppointmentHistoryPage — Lịch sử cuộc hẹn (DOCTOR)
 * GET  /doctor/appointments/history
 * PUT  /doctor/appointments/{id}/status?status=IN_PROGRESS|COMPLETED
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDoctorHistory } from '../../hooks/useAppointments';
import { doctorUpdateAppointmentStatus } from '../../api/doctor';
import { formatDate, formatTime } from '../../utils/formatters';

const STATUS_MAP = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  ARRIVED:     { label: 'Đã đến',       cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Đang khám',    cls: 'bg-green-100 text-green-700' },
  COMPLETED:   { label: 'Hoàn tất',     cls: 'bg-gray-100 text-gray-600' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700' },
  NO_SHOW:     { label: 'Vắng mặt',     cls: 'bg-orange-100 text-orange-700' },
};

const TABS = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'active',    label: 'Cần khám' },
  { key: 'completed', label: 'Đã khám' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function AppointmentHistoryPage() {
  const { data: appointments, loading, error, refetch } = useDoctorHistory();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const filtered = appointments.filter(a => {
    const matchSearch = !search ||
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.symptoms?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (tab === 'active') return ['PENDING', 'ARRIVED', 'IN_PROGRESS'].includes(a.status);
    if (tab === 'completed') return a.status === 'COMPLETED';
    if (tab === 'cancelled') return ['CANCELLED', 'NO_SHOW'].includes(a.status);
    return true;
  });

  const handleStatus = async (status) => {
    if (!selected?.appointmentId) return;
    setUpdating(true);
    try {
      await doctorUpdateAppointmentStatus(selected.appointmentId, status);
      await refetch();
      setSelected(prev => prev ? { ...prev, status } : prev);
    } catch {
      /* lỗi hiển thị qua alert đơn giản */
    } finally {
      setUpdating(false);
    }
  };

  const getStatus = (s) => STATUS_MAP[s] || { label: s, cls: 'bg-gray-100 text-gray-500' };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Lịch sử cuộc hẹn</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {error ? 'Không thể tải dữ liệu từ server' : `Tổng cộng ${appointments.length} cuộc hẹn`}
          </p>
        </div>
        <Link to="/dashboard/prescription"
          className="bg-green-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-green-700 text-center">
          + Tạo bệnh án
        </Link>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          ⚠️ {error}
        </div>
      )}

      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên bệnh nhân hoặc triệu chứng..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">Không có cuộc hẹn nào</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Bệnh nhân</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Ngày · Giờ</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => {
                  const st = getStatus(a.status);
                  return (
                    <tr key={a.appointmentId} onClick={() => setSelected(a)}
                      className={`cursor-pointer hover:bg-gray-50 ${selected?.appointmentId === a.appointmentId ? 'bg-green-50' : ''}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800">{a.patientName || '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{a.symptoms || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 hidden sm:table-cell">
                        {formatDate(a.workDate)} · {formatTime(a.startTime)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div>
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
              <h3 className="font-bold text-gray-800">{selected.patientName}</h3>
              <div className="space-y-2 text-xs">
                {[
                  ['Ngày khám', formatDate(selected.workDate)],
                  ['Giờ', formatTime(selected.startTime)],
                  ['Triệu chứng', selected.symptoms],
                  ['Mã lịch', selected.appointmentId],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-700 text-right max-w-[55%] break-all">{v}</span>
                  </div>
                ))}
              </div>
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${getStatus(selected.status).cls}`}>
                {getStatus(selected.status).label}
              </span>
              <div className="flex flex-col gap-2 pt-1">
                {['ARRIVED', 'IN_PROGRESS'].includes(selected.status) && (
                  <button type="button" disabled={updating} onClick={() => handleStatus('IN_PROGRESS')}
                    className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60">
                    Bắt đầu khám
                  </button>
                )}
                {['IN_PROGRESS', 'ARRIVED'].includes(selected.status) && (
                  <button type="button" disabled={updating} onClick={() => handleStatus('COMPLETED')}
                    className="w-full bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60">
                    Hoàn tất khám
                  </button>
                )}
                <Link to="/dashboard/prescription" state={{ appointmentId: selected.appointmentId }}
                  className="block text-center border border-green-200 text-green-700 text-xs font-bold py-2.5 rounded-xl hover:bg-green-50">
                  📋 Tạo bệnh án
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-sm">Chọn cuộc hẹn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
