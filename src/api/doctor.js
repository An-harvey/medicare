/**
 * doctorApi — /api/doctor  (Role: DOCTOR)
 * ──────────────────────────────────────────────────────────────────
 *
 * 24. PUT  /doctor/profile                      → DoctorDetailResponseDTO
 *     Body JSON: { imageUrl, expertiseDescription, biography }
 *     (nếu upload ảnh: multipart, field avatarFile)
 *
 * 25. GET  /doctor/schedules?date=yyyy-MM-dd    → ScheduleResponseDTO[]
 *
 * 26. GET  /doctor/appointments/history         → AppointmentResponseDTO[]
 *
 * 27. POST /doctor/medical-records              → MedicalRecordResponseDTO (201)
 *     Body: { appointmentId, clinicalDiagnosis, doctorNotes,
 *             diseases:[{diseaseId,isPrimary}],
 *             medicines:[{medicineId,quantity,dosageInstructions}] | null }
 *
 * 28. GET  /doctor/statistics                   → DoctorStatisticsResponseDTO
 *     { totalExaminedThisWeek, totalExaminedThisMonth, totalPendingAppointments }
 */
import api from './config';

/* ── Hồ sơ bác sĩ — BẮT BUỘC multipart/form-data, field `dto` (lo_trinh.txt §13.3) ── */
export const doctorUpdateProfile = (dto, avatarFile) => {
  const form = new FormData();
  form.append('dto', JSON.stringify({
    imageUrl:             dto.imageUrl             ?? null,
    expertiseDescription: dto.expertiseDescription ?? null,
    biography:            dto.biography            ?? null,
  }));
  if (avatarFile) form.append('avatarFile', avatarFile);
  return api.put('/doctor/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/* ── Lịch làm việc theo ngày ── */
export const doctorGetSchedulesByDate = (date) =>
  api.get('/doctor/schedules', { params: { date } }); // date: "yyyy-MM-dd"

/* ── Lịch sử cuộc hẹn ── */
export const doctorGetAppointmentHistory = () =>
  api.get('/doctor/appointments/history');

/* ── Tạo bệnh án (sau khi khám) ── */
export const doctorCreateMedicalRecord = (data) =>
  api.post('/doctor/medical-records', {
    appointmentId:     data.appointmentId,
    clinicalDiagnosis: data.clinicalDiagnosis,
    doctorNotes:       data.doctorNotes,
    diseases: (data.diseases || []).map(d => ({
      diseaseId: d.diseaseId,
      isPrimary: d.isPrimary ?? false,
    })),
    medicines: data.medicines?.length
      ? data.medicines.map(m => ({
          medicineId:         m.medicineId,
          quantity:           m.quantity,
          dosageInstructions: m.dosageInstructions,
        }))
      : null, // null nếu không kê đơn
  });

/* ── Thống kê hiệu suất ── */
export const doctorGetStatistics = () =>
  api.get('/doctor/statistics');

/* ── Bổ sung lo_trinh.txt §13.3 ── */
export const doctorGetUpcomingAppointments = () =>
  api.get('/doctor/appointments/upcoming');

export const doctorUpdateAppointmentStatus = (id, status) =>
  api.put(`/doctor/appointments/${id}/status`, null, { params: { status } });

export const doctorGetMedicalRecords = () =>
  api.get('/doctor/medical-records');

export const doctorGetMedicalRecordDetails = (id) =>
  api.get(`/doctor/medical-records/${id}`);

export const doctorUpdateMedicalRecord = (id, data) =>
  api.put(`/doctor/medical-records/${id}`, data);

export const doctorGetPatientProfile = (patientId) =>
  api.get(`/doctor/patients/${patientId}/profile`);

// ── Alias exports (tương thích với các component cũ) ──
export const updateDoctorProfile          = doctorUpdateProfile;
export const getDoctorSchedulesByDate     = doctorGetSchedulesByDate;
export const getDoctorAppointmentHistory  = doctorGetAppointmentHistory;
export const createMedicalRecord          = doctorCreateMedicalRecord;
export const getDoctorStatistics          = doctorGetStatistics;
