/**
 * doctorApi — /api/doctor  (Role: DOCTOR)
 * ──────────────────────────────────────────────────────────────────
 * BE enum AppointmentStatus: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 *
 * 24. PUT  /doctor/profile                          → DoctorDetailResponseDTO (multipart)
 * 25. GET  /doctor/schedules?date=yyyy-MM-dd        → ScheduleResponseDTO[]
 * 26. GET  /doctor/appointments/history             → AppointmentResponseDTO[]
 * 27. GET  /doctor/appointments/upcoming            → AppointmentResponseDTO[] (PENDING+CHECK_IN)
 * 28. PUT  /doctor/appointments/{id}/status?status= → 204 No Content
 * 29. POST /doctor/medical-records                  → MedicalRecordResponseDTO (201)
 *         → Tự động chuyển appointment → COMPLETED
 * 30. PUT  /doctor/medical-records/{id}             → MedicalRecordResponseDTO
 *         fields: { diagnosis, notes }  ← KHÁC với field tạo mới
 * 31. GET  /doctor/statistics                       → DoctorStatisticsResponseDTO
 * 32. GET  /doctor/patients/{patientId}/profile     → PatientProfileResponseDTO
 */
import api from './config';

/* ── Hồ sơ bác sĩ — multipart/form-data ── */
export const doctorUpdateProfile = (dto, avatarFile) => {
  const form = new FormData();
  // lưu ý ::::
  form.append(
  'dto',
  new Blob(
    [
      JSON.stringify({
        imageUrl: dto.imageUrl ?? null,
        expertiseDescription: dto.expertiseDescription ?? null,
        biography: dto.biography ?? null,
      })
    ],
    {
      type: 'application/json'
    }
  )
);
  if (avatarFile) form.append('avatarFile', avatarFile);
  return api.put('/doctor/profile', form);
};

/* ── Lịch làm việc theo ngày ── */
export const doctorGetSchedulesByDate = (date) =>
  api.get('/doctor/schedules', { params: { date } });

/* ── Lịch sử cuộc hẹn (tất cả status) ── */
export const doctorGetAppointmentHistory = () =>
  api.get('/doctor/appointments/history');

/**
 * doctorGetUpcomingAppointments — Danh sách chờ khám (lo_trinh.txt Bước 3)
 * BE có endpoint riêng. Trả về PENDING + CHECK_IN.
 * FE sort: CHECK_IN lên trên PENDING.
 */
export const doctorGetUpcomingAppointments = () =>
  api.get('/doctor/appointments/upcoming');

/* ── Tạo bệnh án ── */
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
      : null,
  });

/* ── Thống kê hiệu suất — BE có thể trả null ── */
export const doctorGetStatistics = () =>
  api.get('/doctor/statistics');

/**
 * Danh mục bệnh lý để kê bệnh án (lo_trinh.txt §4)
 * GET /doctor/diseases?keyword=&page=0&size=10
 */
export const doctorGetDiseases = (params = {}) =>
  api.get('/doctor/diseases', { params });

/**
 * Danh mục thuốc để kê đơn (lo_trinh.txt §4)
 * GET /doctor/medicines?keyword=&page=0&size=10
 */
export const doctorGetMedicines = (params = {}) =>
  api.get('/doctor/medicines', { params });

/* ── Cập nhật trạng thái lịch hẹn (doctor) ── */
export const doctorUpdateAppointmentStatus = (id, status) =>
  api.put(`/doctor/appointments/${id}/status`, null, { params: { status } });

/* ── Hồ sơ bệnh án ── */
export const doctorGetMedicalRecords = () =>
  api.get('/doctor/medical-records');

export const doctorGetMedicalRecordDetails = (id) =>
  api.get(`/doctor/medical-records/${id}`);

/**
 * doctorUpdateMedicalRecord — Sửa bệnh án (lo_trinh.txt Bước 7)
 * ⚠️ Field name KHÁC với khi tạo:
 *   - Tạo dùng: clinicalDiagnosis, doctorNotes
 *   - Sửa dùng: diagnosis, notes
 * Chỉ sửa được diagnosis và notes, KHÔNG sửa được diseases/medicines
 */
export const doctorUpdateMedicalRecord = (id, data) =>
  api.put(`/doctor/medical-records/${id}`, {
    diagnosis: data.diagnosis,
    notes:     data.notes,
  });

export const doctorGetPatientProfile = (patientId) =>
  api.get(`/doctor/patients/${patientId}/profile`);

// ── Alias exports ──
export const updateDoctorProfile         = doctorUpdateProfile;
export const getDoctorSchedulesByDate    = doctorGetSchedulesByDate;
export const getDoctorAppointmentHistory = doctorGetAppointmentHistory;
export const createMedicalRecord         = doctorCreateMedicalRecord;
export const getDoctorStatistics         = doctorGetStatistics;
