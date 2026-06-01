/**
 * Schedule & Appointment API
 * DTO: ScheduleCreateRequestDTO, AppointmentRequestDTO
 */
import api from './config';

/* ─── Schedule (Admin tạo lịch làm việc cho bác sĩ) ─── */

/**
 * Tạo một khung lịch làm việc cho bác sĩ
 * @param {{ doctorId: string, workDate: string, timeSlotId: number, maxPatients: number }} data
 *        — ScheduleCreateRequestDTO
 *        workDate format: "yyyy-MM-dd"
 */
export const createSchedule = (data) =>
  api.post('/admin/schedules', {
    doctorId:    data.doctorId,
    workDate:    data.workDate,
    timeSlotId:  data.timeSlotId,
    maxPatients: data.maxPatients,
  });

/**
 * Lấy lịch làm việc của một bác sĩ theo tuần/ngày
 * @param {{ doctorId?, date?, startDate?, endDate? }} params
 */
export const getSchedules = (params = {}) =>
  api.get('/schedules', { params });

/**
 * Lấy các time-slot còn trống của bác sĩ theo ngày (dùng cho booking widget)
 * @param {{ doctorId: string, date: string }} params
 */
export const getAvailableSlots = (params) =>
  api.get('/schedules/available', { params });

/**
 * Xóa một lịch làm việc (admin)
 */
export const deleteSchedule = (scheduleId) =>
  api.delete(`/admin/schedules/${scheduleId}`);

/* ─── Appointment (Patient đặt lịch) ─── */

/**
 * Bệnh nhân đặt lịch khám
 * @param {{ doctorId: string, scheduleId: string, symptoms: string }} data
 *        — AppointmentRequestDTO
 */
export const createAppointment = (data) =>
  api.post('/appointments', {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
  });

/**
 * Lấy danh sách lịch hẹn của bệnh nhân hiện tại
 * @param {{ status?, page?, size? }} params
 */
export const getMyAppointments = (params = {}) =>
  api.get('/appointments/my', { params });

/**
 * Lấy chi tiết một lịch hẹn
 */
export const getAppointmentById = (appointmentId) =>
  api.get(`/appointments/${appointmentId}`);

/**
 * Hủy lịch hẹn (patient)
 */
export const cancelAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/cancel`);

/* ─── Doctor: xem lịch hẹn của mình ─── */

/**
 * Bác sĩ xem danh sách lịch hẹn theo ngày/tuần
 * @param {{ date?, startDate?, endDate?, status? }} params
 */
export const getDoctorAppointments = (params = {}) =>
  api.get('/doctor/appointments', { params });

/* ─── Admin & Staff: xem toàn bộ lịch hẹn ─── */

/**
 * Lấy tất cả lịch hẹn (admin/staff)
 * @param {{ date?, doctorId?, specialtyId?, status?, page?, size? }} params
 */
export const getAllAppointments = (params = {}) =>
  api.get('/admin/appointments', { params });

/**
 * Staff cập nhật trạng thái lịch hẹn
 * @param {string} appointmentId
 * @param {'ARRIVED'|'NOT_ARRIVED'|'IN_PROGRESS'|'CANCELLED'|'COMPLETED'} status
 */
export const updateAppointmentStatus = (appointmentId, status) =>
  api.patch(`/staff/appointments/${appointmentId}/status`, { status });

/**
 * Staff tra cứu lịch hẹn qua CCCD bệnh nhân
 */
export const searchAppointmentByCCCD = (cccd) =>
  api.get('/staff/appointments/search', { params: { cccd } });

/**
 * Staff đặt lịch hẹn trực tiếp tại quầy
 */
export const staffCreateAppointment = (data) =>
  api.post('/staff/appointments', {
    doctorId:   data.doctorId,
    scheduleId: data.scheduleId,
    symptoms:   data.symptoms,
    patientCCCD: data.patientCCCD,
  });
