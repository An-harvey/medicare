/**
 * patientApi — /api/patient  (Role: PATIENT)
 * ──────────────────────────────────────────────────────────────────
 *
 * 32. GET  /api/patient/profile            → PatientProfileResponseDTO
 *     { patientId, fullName, email, phone, cccd, dob, bloodType,
 *       allergyHistory, personalMedicalHistory, familyMedicalHistory, imageUrl }
 *
 * 33. POST /api/patient/profile            → PatientProfileResponseDTO
 *     multipart/form-data: field "data" (JSON string) + "avatarFile" (optional)
 *
 * 34. POST /api/patient/appointments       → AppointmentResponseDTO (201)
 *     { doctorId, scheduleId, symptoms }
 *
 * 35. GET  /api/patient/appointments       → AppointmentResponseDTO[]
 *     { appointmentId, patientName, doctorName, workDate, startTime,
 *       symptoms, status, cancelReason }
 *
 * 36. PUT  /api/patient/appointments/{id}/cancel?reason= → String "Đã hủy..."
 *
 * 37. GET  /api/patient/medical-records    → MedicalRecordResponseDTO[]
 *     { medicalRecordId, appointmentId, patientName, doctorName,
 *       clinicalDiagnosis, doctorNotes, diagnosedDiseases: string[] }
 */
import api from './config';

/* ── Profile ── */
export const patientGetProfile = () =>
  api.get('/patient/profile');

export const patientUpdateProfile = (dto, avatarFile) => {
  // BE nhận multipart/form-data: field "data" là JSON string + "avatarFile" optional
  const form = new FormData();
  form.append('data', JSON.stringify({
    dob:                    dto.dob                    || null,
    bloodType:              dto.bloodType              || null,
    allergyHistory:         dto.allergyHistory         || null,
    personalMedicalHistory: dto.personalMedicalHistory || null,
    familyMedicalHistory:   dto.familyMedicalHistory   || null,
    imageUrl:               dto.imageUrl               || null,
  }));
  if (avatarFile) form.append('avatarFile', avatarFile);
  return api.post('/patient/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/* ── Appointments ── */
export const patientBookAppointment = (data) =>
  api.post('/patient/appointments', {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
  });

export const patientGetAppointments = () =>
  api.get('/patient/appointments');

export const patientCancelAppointment = (id, reason = 'Bệnh nhân tự hủy') =>
  api.put(`/patient/appointments/${id}/cancel`, null, { params: { reason } });

/* ── Medical Records ── */
export const patientGetMedicalRecords = () =>
  api.get('/patient/medical-records');

// ── Alias exports (tương thích với các component cũ) ──
export const bookAppointment       = patientBookAppointment;
export const getPatientProfile     = patientGetProfile;
export const updatePatientProfile  = patientUpdateProfile;
export const getMyAppointments     = patientGetAppointments;
export const cancelAppointment     = patientCancelAppointment;
export const getMyMedicalRecords   = patientGetMedicalRecords;
