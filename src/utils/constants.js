/**
 * constants.js — Toàn bộ enum, label, config dùng chung
 * ──────────────────────────────────────────────────────
 * Nguồn: lo_trinh.txt + BE enum AppointmentStatus.java
 *
 * BE enum: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
 */

// ── Appointment Status — đúng theo BE enum ──
export const APPOINTMENT_STATUS = {
  PENDING:     { label: 'Chờ xác nhận', color: 'yellow' },
  CONFIRMED:   { label: 'Đã xác nhận',  color: 'blue' },
  CHECK_IN:    { label: 'Đã check-in',  color: 'cyan' },
  IN_PROGRESS: { label: 'Đang khám',    color: 'green' },
  COMPLETED:   { label: 'Hoàn tất',     color: 'gray' },
  CANCELLED:   { label: 'Đã hủy',       color: 'red' },
};

// ── Tailwind badge class theo status ──
export const STATUS_BADGE = {
  PENDING:     'bg-yellow-100 text-yellow-700',
  CONFIRMED:   'bg-blue-100 text-blue-700',
  CHECK_IN:    'bg-cyan-100 text-cyan-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED:   'bg-gray-100 text-gray-600',
  CANCELLED:   'bg-red-100 text-red-700',
};

export const STATUS_DOT = {
  PENDING:     'bg-yellow-500',
  CONFIRMED:   'bg-blue-500',
  CHECK_IN:    'bg-cyan-500',
  IN_PROGRESS: 'bg-green-500',
  COMPLETED:   'bg-gray-400',
  CANCELLED:   'bg-red-400',
};

// ── Schedule Status (từ BE enum ScheduleStatus.java) ──
export const SCHEDULE_STATUS = {
  AVAILABLE: { label: 'Còn chỗ', cls: 'bg-green-100 text-green-700' },
  FULL:      { label: 'Hết chỗ', cls: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Đã hủy',  cls: 'bg-gray-100 text-gray-400' },
};

// ── Payment Status (lo_trinh.txt §19) ──
export const PAYMENT_STATUS = {
  UNPAID:    { label: 'Chưa thanh toán', cls: 'bg-red-100 text-red-700' },
  PAID:      { label: 'Đã thanh toán',   cls: 'bg-green-100 text-green-700' },
  REFUNDED:  { label: 'Đã hoàn tiền',    cls: 'bg-orange-100 text-orange-700' },
  CANCELLED: { label: 'Đã hủy',          cls: 'bg-gray-100 text-gray-500' },
};

// ── Payment Method ──
export const PAYMENT_METHOD = {
  ONLINE: { label: 'VNPay Online' },
  CASH:   { label: 'Tiền mặt tại quầy' },
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
// BE có thể trả:
//   - Chỉ tên file:  "abc.jpg"             → ghép thành http://localhost:8080/api/images/abc.jpg
//   - Full path:     "/api/images/abc.jpg" → ghép thành http://localhost:8080/api/images/abc.jpg
//   - Full URL:      "http://..."          → dùng thẳng
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // Đã là full URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  // Chứa "/api/images/" → chỉ lấy phần sau
  const match = imageUrl.match(/\/api\/images\/(.+)/);
  if (match) return `${IMAGE_BASE_URL}/${match[1]}`;
  // Chỉ là tên file
  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

import { ROLE_HOME } from './routes';

// ── Redirect route theo role sau login (lo_trinh.txt mục 8.1) ──
export const ROLE_HOME_ROUTE = {
  ...ROLE_HOME,
  // BE uppercase aliases
  ADMIN:   ROLE_HOME.ADMIN,
  DOCTOR:  ROLE_HOME.DOCTOR,
  STAFF:   ROLE_HOME.STAFF,
  PATIENT: ROLE_HOME.PATIENT,
};
