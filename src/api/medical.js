/**
 * Medical Records & Prescriptions API
 * DTO: MedicalRecordCreateRequestDTO, DiseaseDiagnosisRequestDTO,
 *      MedicinePrescriptionRequestDTO
 */
import api from './config';

/* ─── Medical Records ─── */

/**
 * Bác sĩ tạo hồ sơ bệnh án sau khi khám
 * @param {{
 *   appointmentId: string,
 *   clinicalDiagnosis: string,
 *   doctorNotes: string,
 *   diseases: Array<{ diseaseId: number, isPrimary: boolean }>,
 *   medicines?: Array<{ medicineId: number, quantity: number, dosageInstructions: string }>
 * }} data — MedicalRecordCreateRequestDTO
 */
export const createMedicalRecord = (data) =>
  api.post('/doctor/medical-records', {
    appointmentId:     data.appointmentId,
    clinicalDiagnosis: data.clinicalDiagnosis,
    doctorNotes:       data.doctorNotes,
    diseases: (data.diseases || []).map((d) => ({
      diseaseId: d.diseaseId,
      isPrimary: d.isPrimary ?? false,
    })),
    medicines: data.medicines
      ? data.medicines.map((m) => ({
          medicineId:          m.medicineId,
          quantity:            m.quantity,
          dosageInstructions:  m.dosageInstructions,
        }))
      : null,
  });

/**
 * Lấy hồ sơ bệnh án theo lịch hẹn
 */
export const getMedicalRecordByAppointment = (appointmentId) =>
  api.get(`/medical-records/appointment/${appointmentId}`);

/**
 * Bệnh nhân xem lịch sử hồ sơ bệnh án của mình
 * @param {{ page?, size? }} params
 */
export const getMyMedicalRecords = (params = {}) =>
  api.get('/patients/medical-records', { params });

/**
 * Bác sĩ xem lịch sử bệnh nhân đã từng khám
 * @param {{ patientId?, keyword?, page?, size? }} params
 */
export const getDoctorPatientHistory = (params = {}) =>
  api.get('/doctor/patients', { params });

/**
 * Bệnh nhân xem đơn thuốc của mình
 * @param {{ page?, size? }} params
 */
export const getMyPrescriptions = (params = {}) =>
  api.get('/patients/prescriptions', { params });
