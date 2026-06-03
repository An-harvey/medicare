/**
 * HealthRecords — Hồ sơ sức khỏe
 * ──────────────────────────────
 * Role : PATIENT
 * API  : GET /api/patient/medical-records → List<MedicalRecordResponseDTO>
 *
 * MedicalRecordResponseDTO:
 *   { medicalRecordId, appointmentId, patientName, doctorName,
 *     clinicalDiagnosis, doctorNotes, diagnosedDiseases: string[] }
 *
 */
import { useState } from 'react';
import { useMyMedicalRecords } from '../../hooks/useAppointments';

export default function HealthRecords() {
  const { data: records, loading } = useMyMedicalRecords();

  const [selected, setSelected] = useState(null);

  const current = selected || records[0];

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
              <button key={r.medicalRecordId || idx} onClick={() => setSelected(r)}
                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md
                  ${current?.medicalRecordId === r.medicalRecordId ? 'border-blue-400 shadow-sm' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${current?.medicalRecordId === r.medicalRecordId ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-xs text-gray-400">{r.appointmentDate || '---'}</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5 line-clamp-2">{r.clinicalDiagnosis}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.doctorName}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Chi tiết hồ sơ ── */}
          {current && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">Bệnh án</span>
                  <h2 className="text-lg font-extrabold text-gray-800 mt-2">{current.clinicalDiagnosis}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{current.doctorName} · {current.appointmentDate || '---'}</p>
                </div>
                <button className="shrink-0 border border-gray-200 text-gray-500 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-50">
                  🖨️ In hồ sơ
                </button>
              </div>

              {/* Bệnh lý chẩn đoán */}
              {current.diagnosedDiseases?.length > 0 && (
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
              {current.doctorNotes && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">📝 Lời dặn của bác sĩ</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{current.doctorNotes}</p>
                </div>
              )}

              {/* ID để tra cứu */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Mã hồ sơ: <span className="font-mono">{current.medicalRecordId}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
