import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ── DOCTOR: medicines from catalog API ──
import { useMedicines } from '../../hooks/useCatalog';
// ── DOCTOR: create medical record ──
import { createMedicalRecord } from '../../api/doctor';
// ── DOCTOR: recent appointment history ──
import { useDoctorHistory } from '../../hooks/useAppointments';

const UNITS = ['viên', 'gói', 'ống', 'chai', 'tuýp'];
const FREQ  = ['1 lần/ngày', '2 lần/ngày', '3 lần/ngày', 'Khi cần', 'Trước ăn', 'Sau ăn'];

// Parse startTime "HH:mm:ss" → "HH:mm"
function parseTime(t) {
  if (!t) return '';
  return t.substring(0, 5);
}

// Format date "yyyy-MM-dd" → "dd/MM/yyyy"
function formatDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`;
  } catch { return d; }
}

export default function PrescriptionPage() {
  const location = useLocation();
  // ── DOCTOR: medicines from catalog API ──
  // useMedicines() → GET /api/admin/medicines → Page<MedicineResponseDTO>
  // MedicineResponseDTO: { id, name, unit, usageInstructions }
  const { data: medicines, loading: loadingMeds } = useMedicines();

  // ── DOCTOR: recent appointment history ──
  // useDoctorHistory() → GET /api/doctor/appointments/history → List<AppointmentResponseDTO>
  const { data: historyData, loading: loadingHistory } = useDoctorHistory();

  // Form state
  const [drugs, setDrugs] = useState([{ medicineId: '', name: '', qty: '', unit: 'viên', freq: '1 lần/ngày', days: '7', note: '' }]);
  const [form, setForm] = useState({
    appointmentId:     location.state?.appointmentId || '',
    clinicalDiagnosis: '',
    doctorNotes:       '',
  });

  useEffect(() => {
    if (location.state?.appointmentId) {
      setForm(f => ({ ...f, appointmentId: location.state.appointmentId }));
    }
  }, [location.state?.appointmentId]);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [apiError, setApiError] = useState('');

  const addDrug = () => setDrugs(d => [...d, { medicineId: '', name: '', qty: '', unit: 'viên', freq: '1 lần/ngày', days: '7', note: '' }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_, idx) => idx !== i));
  const updateDrug = (i, field, val) => setDrugs(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  // Khi chọn thuốc từ datalist — tìm medicine theo tên để lấy id
  const handleMedicineName = (i, name) => {
    const found = medicines.find(m => m.name === name);
    updateDrug(i, 'name', name);
    if (found) updateDrug(i, 'medicineId', found.id);
  };

  // ── DOCTOR: create medical record ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setApiError('');

    try {
      // POST /api/doctor/medical-records → MedicalRecordResponseDTO
      // MedicalRecordCreateRequestDTO: { appointmentId, clinicalDiagnosis, doctorNotes, diseases, medicines }
      await createMedicalRecord({
        appointmentId:     form.appointmentId?.trim() || undefined,
        clinicalDiagnosis: form.clinicalDiagnosis,
        doctorNotes:       form.doctorNotes,
        diseases:          [], // TODO: tích hợp disease selector
        medicines: drugs
          .filter(d => d.medicineId || d.name) // bỏ qua hàng trống
          .map(d => ({
            medicineId:         d.medicineId ? Number(d.medicineId) : null,
            quantity:           Number(d.qty) || 1,
            dosageInstructions: `${d.freq}${d.days ? `, ${d.days} ngày` : ''}${d.note ? `. ${d.note}` : ''}`,
          })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setApiError(err.message || 'Không thể tạo bệnh án. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Kê đơn thuốc</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tạo và quản lý đơn thuốc cho bệnh nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form kê đơn */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* ── Thông tin lịch hẹn ── */}
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Thông tin lịch khám</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Mã lịch hẹn (Appointment ID) <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.appointmentId}
                  onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))}
                  placeholder="Nhập mã lịch hẹn..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50" />
                <p className="text-[10px] text-gray-400 mt-1">Xem ở mục Lịch sử bên phải</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Chẩn đoán lâm sàng <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.clinicalDiagnosis}
                  onChange={e => setForm(f => ({ ...f, clinicalDiagnosis: e.target.value }))}
                  placeholder="Tăng huyết áp giai đoạn 1..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50" />
              </div>
            </div>

            {/* ── Danh sách thuốc ── */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Danh sách thuốc</h2>
                <button type="button" onClick={addDrug}
                  className="text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 font-semibold transition-colors">
                  + Thêm thuốc
                </button>
              </div>

              {/* Loading medicines */}
              {loadingMeds && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  Đang tải danh mục thuốc...
                </div>
              )}

              <div className="space-y-3">
                {drugs.map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Thuốc #{i + 1}</span>
                      {drugs.length > 1 && (
                        <button type="button" onClick={() => removeDrug(i)} className="text-red-400 hover:text-red-600 text-xs">✕ Xóa</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tên thuốc</label>
                        {/* ── DOCTOR: medicines from catalog API ── */}
                        <input
                          list={`med-list-${i}`}
                          value={d.name}
                          onChange={e => handleMedicineName(i, e.target.value)}
                          placeholder="Nhập hoặc chọn thuốc..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                        {/* datalist từ API medicines (thay thế hardcode MEDICINES) */}
                        <datalist id={`med-list-${i}`}>
                          {medicines.map(m => (
                            <option key={m.id} value={m.name}>
                              {m.unit ? `(${m.unit})` : ''}
                            </option>
                          ))}
                        </datalist>
                        {/* Hiện unit nếu chọn từ catalog */}
                        {d.medicineId && (
                          <p className="text-[10px] text-green-600 mt-0.5">
                            ✓ {medicines.find(m => m.id == d.medicineId)?.unit || ''}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Số lượng</label>
                        <div className="flex gap-1">
                          <input type="number" value={d.qty} onChange={e => updateDrug(i, 'qty', e.target.value)}
                            placeholder="30" min="1"
                            className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                          <select value={d.unit} onChange={e => updateDrug(i, 'unit', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none bg-white">
                            {UNITS.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tần suất</label>
                        <select value={d.freq} onChange={e => updateDrug(i, 'freq', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none bg-white">
                          {FREQ.map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Số ngày</label>
                        <input type="number" value={d.days} onChange={e => updateDrug(i, 'days', e.target.value)}
                          min="1" placeholder="7"
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Ghi chú</label>
                        <input value={d.note} onChange={e => updateDrug(i, 'note', e.target.value)}
                          placeholder="Uống sau ăn..."
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lời dặn */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lời dặn của bác sĩ</label>
              <textarea
                value={form.doctorNotes}
                onChange={e => setForm(f => ({ ...f, doctorNotes: e.target.value }))}
                rows={3} placeholder="Tái khám sau 2 tuần, hạn chế muối, tập thể dục nhẹ..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50 resize-none" />
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                ⚠️ {apiError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Đang lưu...' : '💾 Lưu đơn thuốc'}
              </button>
              <button type="button"
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                🖨️ In đơn
              </button>
              {saved && <span className="text-green-600 text-sm font-medium">✓ Đã lưu thành công</span>}
            </div>
          </form>
        </div>

        {/* ── DOCTOR: Recent appointment history từ API ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Lịch sử lịch hẹn</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click để điền appointmentId</p>
          </div>

          {loadingHistory && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {/* ── DOCTOR: useDoctorHistory() → AppointmentResponseDTO ── */}
            {historyData.length > 0
              ? historyData.slice(0, 5).map((appt) => (
                  <div key={appt.appointmentId}
                    onClick={() => setForm(f => ({ ...f, appointmentId: String(appt.appointmentId) }))}
                    className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${form.appointmentId === String(appt.appointmentId) ? 'bg-green-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{appt.patientName || 'Bệnh nhân'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{appt.symptoms || 'Không có triệu chứng'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {appt.workDate ? formatDate(appt.workDate) : ''}
                          {appt.startTime ? ` · ${parseTime(appt.startTime)}` : ''}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                        appt.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        #{appt.appointmentId}
                      </span>
                    </div>
                  </div>
                ))
              : !loadingHistory && (
                  // Fallback mock khi chưa có data
                  [
                    { id: 'RX001', patient: 'Lê Văn Cường',   date: '27/05/2026', drugs: 2 },
                    { id: 'RX002', patient: 'Phạm Thu Hà',    date: '27/05/2026', drugs: 3 },
                    { id: 'RX003', patient: 'Nguyễn Thị Mai', date: '20/05/2026', drugs: 4 },
                  ].map(rx => (
                    <div key={rx.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{rx.patient}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{rx.date} · {rx.drugs} loại thuốc</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 bg-gray-100 text-gray-500">
                          Mock
                        </span>
                      </div>
                    </div>
                  ))
                )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
