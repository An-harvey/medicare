/**
 * staffApi — /api/staff  (Role: STAFF)
 * ──────────────────────────────────────────────────────────────────
 *
 * 29. GET  /staff/appointments?cccd=&date=yyyy-MM-dd → AppointmentResponseDTO[]
 *     (cả hai đều optional)
 *
 * 30. POST /staff/appointments/patient/{patientId}   → AppointmentResponseDTO (201)
 *     Body: { doctorId, scheduleId, symptoms }
 *
 * 31. PUT  /staff/appointments/{id}/status?status=   → String "Cập nhật thành công"
 *     status values: ARRIVED | IN_PROGRESS | COMPLETED | NO_SHOW | CANCELLED
 */
import api from './config';

/* ── Tìm kiếm lịch hẹn (theo CCCD, ngày, hoặc cả hai) ── */
export const staffSearchAppointments = (params = {}) =>
  api.get('/staff/appointments', { params }); // { cccd?, date? }

/* ── Đặt lịch tại quầy cho bệnh nhân ── */
export const staffBookForPatient = (patientId, data) =>
  api.post(`/staff/appointments/patient/${patientId}`, {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
  });

/* ── Cập nhật trạng thái lịch hẹn ── */
export const staffUpdateAppointmentStatus = (id, status) =>
  api.put(`/staff/appointments/${id}/status`, null, { params: { status } });

export const staffGetSchedules = (params = {}) =>
  api.get('/staff/schedules', { params });
