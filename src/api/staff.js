/**
 * staffApi — /api/staff  (Role: STAFF)
 * ──────────────────────────────────────────────────────────────────
 * Nguồn: lo_trinh.txt §5
 *
 * Luồng staff:
 *   PENDING  → [Xác nhận] → CONFIRMED
 *   CONFIRMED → [Check-in] → CHECK_IN
 *   PENDING | CONFIRMED → [Hủy] → CANCELLED
 *
 * GET  /staff/appointments?cccd=&date=       → AppointmentResponseDTO[] (bắt buộc ≥1 param)
 * GET  /staff/appointments/pending           → AppointmentResponseDTO[] (toàn bộ PENDING, sắp theo ngày)
 * POST /staff/appointments/patient/{id}      → status CONFIRMED (201)
 * PUT  /staff/appointments/{id}/status       → CONFIRMED | CHECK_IN | CANCELLED
 * GET  /staff/schedules                      → Page<ScheduleResponseDTO>
 */
import api from './config';

/** Tìm lịch hẹn theo CCCD hoặc ngày — bắt buộc ít nhất 1 param */
export const staffSearchAppointments = (params = {}) =>
  api.get('/staff/appointments', { params });

/**
 * Danh sách lịch hẹn chờ xác nhận (PENDING) — toàn hệ thống
 * Không cần param, sắp xếp theo ngày khám tăng dần
 * Dùng cho màn hình tổng quan staff khi vào ca
 */
export const staffGetPendingAppointments = () =>
  api.get('/staff/appointments/pending');

/** Đặt lịch hộ tại quầy → appointment tạo ra với status CONFIRMED */
export const staffBookForPatient = (patientId, data) =>
  api.post(`/staff/appointments/patient/${patientId}`, {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
  });

/**
 * Cập nhật trạng thái lịch hẹn
 * Staff được dùng: CONFIRMED | CHECK_IN | CANCELLED
 */
export const staffUpdateAppointmentStatus = (id, status) =>
  api.put(`/staff/appointments/${id}/status`, null, { params: { status } });

/** Hủy lịch = PUT status=CANCELLED */
export const staffCancelAppointment = (id) =>
  staffUpdateAppointmentStatus(id, 'CANCELLED');

/** Xem lịch làm việc (để đặt lịch hộ) */
export const staffGetSchedules = (params = {}) =>
  api.get('/staff/schedules', { params });
