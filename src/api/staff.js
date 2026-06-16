/**
 * staffApi — /api/staff  (Role: STAFF)
 * ──────────────────────────────────────────────────────────────────
 * Nguồn: lo_trinh.txt §5
 *
 * GET  /staff/appointments?cccd=&date=     → AppointmentResponseDTO[] (bắt buộc ≥1 param)
 * POST /staff/appointments/patient/{id}    → status CONFIRMED (201)
 * PUT  /staff/appointments/{id}/status     → CONFIRMED | CHECK_IN | CANCELLED
 * GET  /staff/schedules                    → Page<ScheduleResponseDTO>
 */
import api from './config';

export const staffSearchAppointments = (params = {}) =>
  api.get('/staff/appointments', { params });

export const staffBookForPatient = (patientId, data) =>
  api.post(`/staff/appointments/patient/${patientId}`, {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
  });

/** Staff cập nhật trạng thái: CONFIRMED | CHECK_IN | CANCELLED */
export const staffUpdateAppointmentStatus = (id, status) =>
  api.put(`/staff/appointments/${id}/status`, null, { params: { status } });

export const staffGetSchedules = (params = {}) =>
  api.get('/staff/schedules', { params });

/** Hủy lịch — alias gọi PUT status=CANCELLED (theo lo_trinh.txt) */
export const staffCancelAppointment = (id, _reason) =>
  staffUpdateAppointmentStatus(id, 'CANCELLED');
