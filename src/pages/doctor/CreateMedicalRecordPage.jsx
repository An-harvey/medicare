import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ── DOCTOR: medicines + diseases from catalog API ──
import { useMedicines, useDiseases } from '../../hooks/useCatalog';
// ── DOCTOR: create medical record ──
import { createMedicalRecord } from '../../api/doctor';
// ── DOCTOR: appointments from upcoming (CHECK_IN + PENDING) ──
import { useDoctorUpcoming } from '../../hooks/useAppointments';

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
  // ── DOCTOR: medicines + diseases from catalog API ──
  const { data: medicines, loading: loadingMeds } = useMedicines();
  const { data: diseases,  loading: loadingDiseases } = useDiseases();

  // ── DOCTOR: danh sách chờ khám (CHECK_IN ưu tiên) ──
  const { data: upcomingData, loading: loadingUpcoming } = useDoctorUpcoming();

  // Form state
  const [drugs, setDrugs] = useState([{ medicineId: '', name: '', unit: '', qty: '', freq: '1 lần/ngày', days: '7', note: '', search: '', showDrop: false }]);
  const [form, setForm] = useState({
    appointmentId:     location.state?.appointmentId || '',
    clinicalDiagnosis: '',
    doctorNotes:       '',
  });
  // Bệnh lý đã chọn: [{ diseaseId, isPrimary, name }]
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  useEffect(() => {
    if (location.state?.appointmentId) {
      setForm(f => ({ ...f, appointmentId: location.state.appointmentId }));
    }
  }, [location.state?.appointmentId]);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [apiError, setApiError] = useState('');

  const addDrug = () => setDrugs(d => [...d, { medicineId: '', name: '', unit: '', qty: '', freq: '1 lần/ngày', days: '7', note: '', search: '', showDrop: false }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_, idx) => idx !== i));
  const updateDrug = (i, field, val) => setDrugs(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  // Chọn thuốc từ dropdown → điền vào dòng thuốc
  const selectMedicine = (i, med) => {
    setDrugs(d => d.map((item, idx) => idx === i
      ? { ...item, medicineId: med.id, name: med.name, unit: med.unit || '', search: '', showDrop: false }
      : item
    ));
  };

// ── DOCTOR: create medical record ──
  const handleSave = async (e) => {
    e.preventDefault();
    setApiError('');

    // ── Validate: bắt buộc có ít nhất 1 bệnh lý chính ──
    if (selectedDiseases.length === 0) {
      setApiError('Vui lòng chọn ít nhất một bệnh lý chẩn đoán.');
      return;
    }
    if (!selectedDiseases.some(d => d.isPrimary)) {
      setApiError('Bắt buộc phải chỉ định ít nhất một bệnh chính (bấm nút "Chính").');
      return;
    }
    if (!form.clinicalDiagnosis.trim()) {
      setApiError('Vui lòng nhập chẩn đoán lâm sàng.');
      return;
    }

    setSaving(true);

    try {
      // POST /api/doctor/medical-records → 201 MedicalRecordResponseDTO
      // Tự động: appointment → COMPLETED, gửi notification cho BN
      await createMedicalRecord({
        appointmentId:     form.appointmentId?.trim() || undefined,
        clinicalDiagnosis: form.clinicalDiagnosis,
        doctorNotes:       form.doctorNotes,
        diseases: selectedDiseases.map(d => ({
          diseaseId: Number(d.diseaseId),
          isPrimary: d.isPrimary,
        })),
        medicines: drugs.filter(d => d.medicineId || d.name).length > 0
          ? drugs
              .filter(d => d.medicineId || d.name)
              .map(d => ({
                medicineId:         d.medicineId ? Number(d.medicineId) : null,
                quantity:           Number(d.qty) || 1,
                dosageInstructions: `${d.freq}${d.days ? `, ${d.days} ngày` : ''}${d.note ? `. ${d.note}` : ''}`,
              }))
          : null, // null nếu không kê đơn
      });
      setSaved(true);
      // Reset form sau khi lưu thành công
      setForm({ appointmentId: '', clinicalDiagnosis: '', doctorNotes: '' });
      setSelectedDiseases([]);
      setDrugs([{ medicineId: '', name: '', unit: '', qty: '', freq: '1 lần/ngày', days: '7', note: '', search: '', showDrop: false }]);
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      // Map lỗi BE theo lo_trinh.txt
      const msg = err?.message || '';
      if (msg.includes('already') || msg.includes('COMPLETED')) {
        setApiError('Ca khám này đã được lập bệnh án trước đó.');
      } else if (msg.includes('isPrimary') || msg.includes('primary')) {
        setApiError('Bắt buộc phải chỉ định ít nhất một bệnh chính.');
      } else if (msg.includes('diseaseId') || msg.includes('disease')) {
        setApiError('Mã bệnh lý không hợp lệ. Vui lòng chọn lại.');
      } else if (msg.includes('medicineId') || msg.includes('medicine')) {
        setApiError('Thuốc không có trong danh mục. Vui lòng kiểm tra lại.');
      } else {
        setApiError(msg || 'Không thể tạo bệnh án. Vui lòng thử lại.');
      }
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

            {/* ── Bệnh lý chẩn đoán ── */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                  Bệnh lý chẩn đoán <span className="text-red-500">*</span>
                </h2>
                <span className="text-xs text-gray-400">{selectedDiseases.length} đã chọn</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">Bắt buộc chọn ít nhất 1 bệnh chính</p>

              {/* Tìm kiếm bệnh lý */}
              <div className="relative mb-2">
                <input
                  value={diseaseSearch}
                  onChange={e => setDiseaseSearch(e.target.value)}
                  placeholder="Tìm mã ICD hoặc tên bệnh..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-gray-50"
                />
              </div>

              {/* Bệnh đã chọn */}
              {selectedDiseases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedDiseases.map(d => (
                    <span key={d.diseaseId}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${d.isPrimary ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
                      {d.isPrimary && <span className="text-[9px] bg-red-600 text-white px-1 rounded">Chính</span>}
                      {d.name}
                      <button onClick={() => setSelectedDiseases(prev => prev.filter(x => x.diseaseId !== d.diseaseId))}
                        className="ml-0.5 hover:text-red-600">✕</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown gợi ý bệnh lý */}
              {diseaseSearch && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm max-h-40 overflow-y-auto">
                  {loadingDiseases ? (
                    <p className="p-3 text-xs text-gray-400 text-center">Đang tải danh mục bệnh lý...</p>
                  ) : diseases.length === 0 ? (
                    <p className="p-3 text-xs text-red-400 text-center">
                      ⚠️ Chưa có danh mục bệnh lý.<br/>
                      <span className="text-gray-400">BE cần mở endpoint /doctor/diseases hoặc /public/diseases</span>
                    </p>
                  ) : (() => {
                    const filtered = diseases
                      .filter(d =>
                        !selectedDiseases.find(s => s.diseaseId === d.id) &&
                        (d.name?.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
                         d.code?.toLowerCase().includes(diseaseSearch.toLowerCase()))
                      )
                      .slice(0, 8);
                    return filtered.length === 0 ? (
                      <p className="p-3 text-xs text-gray-400 text-center">Không tìm thấy "{diseaseSearch}"</p>
                    ) : filtered.map(d => (
                      <div key={d.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-gray-500 mr-2">{d.code}</span>
                          <span className="text-xs text-gray-700">{d.name}</span>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDiseases(prev => [...prev, { diseaseId: d.id, name: d.name, isPrimary: prev.length === 0 }]);
                              setDiseaseSearch('');
                            }}
                            className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-200">
                            Chính
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDiseases(prev => [...prev, { diseaseId: d.id, name: d.name, isPrimary: false }]);
                              setDiseaseSearch('');
                            }}
                            className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-lg hover:bg-blue-100">
                            Phụ
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* ── Danh sách thuốc ── */}
            <div className="border-t border-gray-100 pt-5">              <div className="flex items-center justify-between mb-3">
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
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tên thuốc *</label>

                        {/* ── Thuốc đã chọn → hiện tag, bấm ✕ để đổi ── */}
                        {d.medicineId ? (
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <span className="text-xs font-semibold text-green-800 flex-1 truncate">💊 {d.name}</span>
                            {d.unit && <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded shrink-0">{d.unit}</span>}
                            <button type="button"
                              onClick={() => updateDrug(i, 'medicineId', '') && updateDrug(i, 'name', '') && updateDrug(i, 'unit', '')}
                              onMouseDown={e => {
                                e.preventDefault();
                                setDrugs(prev => prev.map((item, idx) =>
                                  idx === i ? { ...item, medicineId: '', name: '', unit: '', search: '', showDrop: false } : item
                                ));
                              }}
                              className="text-gray-400 hover:text-red-500 shrink-0">✕</button>
                          </div>
                        ) : (
                          /* ── Search dropdown ── */
                          <div className="relative">
                            <input
                              type="text"
                              value={d.search || ''}
                              onChange={e => setDrugs(prev => prev.map((item, idx) =>
                                idx === i ? { ...item, search: e.target.value, showDrop: true } : item
                              ))}
                              onFocus={() => setDrugs(prev => prev.map((item, idx) =>
                                idx === i ? { ...item, showDrop: true } : item
                              ))}
                              onBlur={() => setTimeout(() => setDrugs(prev => prev.map((item, idx) =>
                                idx === i ? { ...item, showDrop: false } : item
                              )), 150)}
                              placeholder="🔍 Tìm tên thuốc..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                            />
                            {d.showDrop && (d.search || '').length >= 1 && (
                              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {loadingMeds ? (
                                  <p className="p-3 text-xs text-gray-400 text-center">Đang tải danh mục thuốc...</p>
                                ) : medicines.length === 0 ? (
                                  <p className="p-3 text-xs text-red-400 text-center">
                                    ⚠️ Chưa có danh mục thuốc.<br/>
                                    <span className="text-gray-400">BE cần mở endpoint /doctor/medicines hoặc /public/medicines</span>
                                  </p>
                                ) : (() => {
                                  const keyword = (d.search || '').toLowerCase();
                                  const filtered = medicines.filter(m =>
                                    m.name?.toLowerCase().includes(keyword)
                                  ).slice(0, 12);
                                  return filtered.length === 0 ? (
                                    <p className="p-3 text-xs text-gray-400 text-center">Không tìm thấy "{d.search}"</p>
                                  ) : filtered.map(m => (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onMouseDown={e => {
                                        e.preventDefault();
                                        setDrugs(prev => prev.map((item, idx) =>
                                          idx === i ? { ...item, medicineId: m.id, name: m.name, unit: m.unit || '', search: '', showDrop: false } : item
                                        ));
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-green-50 text-left border-b border-gray-50 last:border-0"
                                    >
                                      <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                                      {m.unit && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 ml-2">{m.unit}</span>}
                                    </button>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Số lượng</label>
                        <div className="flex gap-1">
                          <input type="number" value={d.qty} onChange={e => updateDrug(i, 'qty', e.target.value)}
                            placeholder="30" min="1"
                            className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-white" />
                          {/* Đơn vị tự điền từ thuốc đã chọn, hoặc chọn thủ công */}
                          <select value={d.unit || 'viên'} onChange={e => updateDrug(i, 'unit', e.target.value)}
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
              <button type="submit" disabled={saving || !form.appointmentId || !form.clinicalDiagnosis || selectedDiseases.length === 0}
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Đang lưu...' : '💾 Lưu bệnh án'}
              </button>
              <button type="button"
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                🖨️ In đơn
              </button>
              {saved && (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  ✅ Đã lưu! Bệnh nhân đã hoàn tất khám
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ── DOCTOR: Danh sách chờ khám — click để điền appointmentId ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Bệnh nhân chờ khám</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click để điền Appointment ID</p>
          </div>

          {loadingUpcoming && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {upcomingData.length > 0
              ? upcomingData.map((appt) => {
                  const isCheckIn = appt.status === 'CHECK_IN';
                  const isSelected = form.appointmentId === String(appt.appointmentId);
                  return (
                    <div key={appt.appointmentId}
                      onClick={() => setForm(f => ({ ...f, appointmentId: String(appt.appointmentId) }))}
                      className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer
                        ${isSelected ? 'bg-green-50 border-l-4 border-green-500' : ''}
                        ${isCheckIn && !isSelected ? 'border-l-4 border-cyan-400' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{appt.patientName || 'Bệnh nhân'}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{appt.symptoms || 'Không có triệu chứng'}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {appt.startTime ? parseTime(appt.startTime) : ''}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                          isCheckIn ? 'bg-cyan-100 text-cyan-700' :
                          appt.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {isCheckIn ? '🔔 Đã đến' : appt.status === 'IN_PROGRESS' ? '⚕️ Đang khám' : 'Chờ'}
                        </span>
                      </div>
                    </div>
                  );
                })
              : !loadingUpcoming && (
                  <p className="px-5 py-6 text-center text-sm text-gray-400">Không có bệnh nhân chờ khám</p>
                )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
