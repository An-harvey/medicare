/**
 * API Index — Central export
 * ───────────────────────────
 * Cấu trúc API theo lo_trinh.txt:
 *   auth.js    — Đăng nhập / Đăng ký
 *   public.js  — Không cần token (specialties, doctors, schedules/available)
 *   patient.js — Role PATIENT
 *   doctor.js  — Role DOCTOR
 *   admin.js   — Role ADMIN
 *   staff.js   — Role STAFF
 *
 * Usage: import { authLogin, getDoctors, patientBookAppointment } from '../api'
 */
export * from './auth';
export * from './public';
export * from './patient';
export * from './doctor';
export * from './admin';
export * from './staff';
export { default as api } from './config';
