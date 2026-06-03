/**
 * constants.js — Toàn bộ enum, label, config dùng chung
 * ──────────────────────────────────────────────────────
 * Nguồn: lo_trinh.txt + api_backend.txt
 */

// ── Appointment Status (từ BE enum AppointmentStatus.java) ──
export const APPOINTMENT_STATUS = {
  PENDING:     { label: 'Chờ xác nhận', color: 'yellow' },
  ARRIVED:     { label: 'Đã đến',       color: 'blue' },
  IN_PROGRESS: { label: 'Đang khám',    color: 'green' },
  COMPLETED:   { label: 'Hoàn tất',     color: 'gray' },
  CANCELLED:   { label: 'Đã hủy',       color: 'red' },
  NO_SHOW:     { label: 'Vắng mặt',     color: 'orange' },
};

// ── Tailwind badge class theo status ──
export const STATUS_BADGE = {
  PENDING:     'bg-yellow-100 text-yellow-700',
  ARRIVED:     'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED:   'bg-gray-100 text-gray-600',
  CANCELLED:   'bg-red-100 text-red-700',
  NO_SHOW:     'bg-orange-100 text-orange-700',
};

export const STATUS_DOT = {
  PENDING:     'bg-yellow-500',
  ARRIVED:     'bg-blue-500',
  IN_PROGRESS: 'bg-green-500',
  COMPLETED:   'bg-gray-400',
  CANCELLED:   'bg-red-400',
  NO_SHOW:     'bg-orange-400',
};

// ── Schedule Status (từ BE enum ScheduleStatus.java) ──
export const SCHEDULE_STATUS = {
  AVAILABLE: { label: 'Còn chỗ', cls: 'bg-green-100 text-green-700' },
  FULL:      { label: 'Hết chỗ', cls: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Đã hủy',  cls: 'bg-gray-100 text-gray-400' },
};

// ── Role enums ──
export const ROLES = {
  ADMIN:   'ADMIN',
  DOCTOR:  'DOCTOR',
  STAFF:   'STAFF',
  PATIENT: 'PATIENT',
};

// roleId trong DB: 1=ADMIN, 2=DOCTOR, 3=STAFF, 4=PATIENT
export const ROLE_ID_MAP = { ADMIN: 1, DOCTOR: 2, STAFF: 3, PATIENT: 4 };

export const ROLE_LABEL = {
  ADMIN:   'Quản trị viên',
  DOCTOR:  'Bác sĩ',
  STAFF:   'Lễ tân',
  PATIENT: 'Bệnh nhân',
};

export const ROLE_BADGE_CLS = {
  ADMIN:   'bg-red-100 text-red-700',
  DOCTOR:  'bg-green-100 text-green-700',
  STAFF:   'bg-purple-100 text-purple-700',
  PATIENT: 'bg-blue-100 text-blue-700',
};

// ── FE role key (lowercase) → BE role (UPPERCASE) ──
export const FE_TO_BE_ROLE = { user: 'PATIENT', doctor: 'DOCTOR', admin: 'ADMIN', staff: 'STAFF' };
export const BE_TO_FE_ROLE = { PATIENT: 'user', DOCTOR: 'doctor', ADMIN: 'admin', STAFF: 'staff' };

// ── API Base URL (VITE_API_URL = http://localhost:8080/api) ──
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:8080';
export const IMAGE_BASE_URL = `${API_BASE_URL}/images`;

// ── Hàm lấy URL ảnh từ imageUrl trả về BE ──
export const getImageUrl = (imageUrl) =>
  imageUrl ? `${IMAGE_BASE_URL}/${imageUrl}` : null;

// ── Redirect route theo role sau login ──
export const ROLE_HOME_ROUTE = {
  ADMIN:   '/dashboard',
  DOCTOR:  '/dashboard',
  STAFF:   '/dashboard',
  PATIENT: '/dashboard',
  // FE lowercase
  user: '/dashboard', doctor: '/dashboard', admin: '/dashboard', staff: '/dashboard',
};
