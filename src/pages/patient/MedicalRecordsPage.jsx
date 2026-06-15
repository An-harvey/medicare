/**
 * MedicalRecordsPage — Hồ sơ sức khỏe (PATIENT)
 * ─────────────────────────────────────────────────
 * Role : PATIENT
 * APIs :
 *   GET /patient/medical-records           → MedicalRecordResponseDTO[] (danh sách)
 *   GET /patient/medical-records/{id}      → MedicalRecordDetailResponseDTO (chi tiết + đơn thuốc)
 *
 * MedicalRecordDetailResponseDTO (lo_trinh.txt Bước 8):
 *   { medicalRecordId, appointmentId, patientName, doctorName, specialtyName,
 *     workDate, clinicalDiagnosis, doctorNotes, diagnosedDiseases: string[],
 *     prescription: { prescriptionId, dispenseStatus,
 *                     items: [{medicineName,unit,quantity,dosageInstructions}] } | null }
 */
import { useState } from 'react';
import { useMyMedicalRecords } from '../../hooks/useAppointments';
import { patientGetMedicalRecordDetails } from '../../api/patient';
import { formatDate } from '../../utils/formatters';

const DISPENSE_STATUS = {
  PENDING:   { label: 'Chưa cấp phát', cls: 'bg-yellow-100 text-yellow-700' },
  DISPENSED: { label: 'Đã cấp phát',   cls: 'bg-green-100 text-green-700' },
};

export default function MedicalRecordsPage() {
  const { data: records, loading } = useMyMedicalRecords();
  const [selected,    setSelected]    = useState(null);
  const [detail,      setDetail]      = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Khi click vào 1 bệnh án → load chi tiết kèm đơn thuốc
  const handleSelect = async (record) => {
    setSelected(record);
    setDetail(null);
    if (!record?.medicalRecordId) return;
    setLoadingDetail(true);
    try {
      const res = await patientGetMedicalRecordDetails(record.medicalRecordId);
      setDetail(res);
    } catch {
      setDetail(record); // fallback về data cơ bản nếu API chi tiết lỗi
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const current = detail || selected;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">Hồ sơ sức khỏe</h1>
        <p className="text-sm text-gray-400 mt-0.5">Lịch sử khám bệnh và chẩn đoán của bạn</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium">Chưa có hồ sơ bệnh án</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Timeline danh sách ── */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Lịch sử khám</p>
            {records.map((r, idx) => (
              <button key={r.medicalRecordId || idx}
                onClick={() => handleSelect(r)}
                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md
                  ${selected?.medicalRecordId === r.medicalRecordId ? 'border-blue-400 shadow-sm' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selected?.medicalRecordId === r.medicalRecordId ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{r.workDate ? formatDate(r.workDate) : r.appointmentDate || '---'}</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5 line-clamp-2">{r.clinicalDiagnosis}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.doctorName}</p>
                    {r.specialtyName && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                        {r.specialtyName}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Chi tiết hồ sơ ── */}
          {selected ? (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">Bệnh án</span>
                      <h2 className="text-lg font-extrabold text-gray-800 mt-2">{current?.clinicalDiagnosis}</h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {current?.doctorName}
                        {current?.specialtyName && ` · ${current.specialtyName}`}
                        {(current?.workDate || current?.appointmentDate) && ` · ${formatDate(current.workDate || current.appointmentDate)}`}
                      </p>
                    </div>
                    <button className="shrink-0 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-50">
                      🖨️ In hồ sơ
                    </button>
                  </div>

                  {/* Bệnh lý chẩn đoán */}
                  {current?.diagnosedDiseases?.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">🔬 Chẩn đoán bệnh lý</p>
                      <div className="flex flex-wrap gap-2">
                        {current.diagnosedDiseases.map((d, i) => (
                          <span key={i} className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lời dặn bác sĩ */}
                  {current?.doctorNotes && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">📝 Lời dặn của bác sĩ</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{current.doctorNotes}</p>
                    </div>
                  )}

                  {/* Đơn thuốc — chỉ có trong detail response */}
                  {current?.prescription && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">💊 Đơn thuốc</p>
                        {current.prescription.dispenseStatus && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            DISPENSE_STATUS[current.prescription.dispenseStatus]?.cls || 'bg-gray-100 text-gray-500'
                          }`}>
                            {DISPENSE_STATUS[current.prescription.dispenseStatus]?.label || current.prescription.dispenseStatus}
                          </span>
                        )}
                      </div>
                      {current.prescription.items?.length > 0 ? (
                        <div className="space-y-2">
                          {current.prescription.items.map((item, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 flex items-start gap-3">
                              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm shrink-0">
                                💊
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm">
                                  {item.medicineName}
                                  {item.unit && <span className="text-gray-400 font-normal text-xs ml-1">({item.unit})</span>}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.dosageInstructions}</p>
                              </div>
                              <span className="shrink-0 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                                x{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Không có thuốc trong đơn</p>
                      )}
                    </div>
                  )}

                  {/* Không có đơn thuốc */}
                  {detail && !current?.prescription && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-xs">
                      Không có đơn thuốc cho lần khám này
                    </div>
                  )}

                  {/* Mã hồ sơ */}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Mã hồ sơ: <span className="font-mono">{current?.medicalRecordId}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center p-12 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-sm">Chọn hồ sơ để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
