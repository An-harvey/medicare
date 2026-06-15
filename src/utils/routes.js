/**
 * routes.js — Route theo lo_trinh.txt mục 8
 * FE dùng /dashboard/* nội bộ; alias /admin/*, /patient/*... redirect trong App.jsx
 */
import { BE_TO_FE_ROLE } from './constants';

export const ROLE_PREFIX = {
  ADMIN:   '/admin',
  DOCTOR:  '/doctor',
  STAFF:   '/staff',
  PATIENT: '/patient',
};

export const ROLE_HOME = {
  // Tất cả role đều dùng /dashboard — Router nội bộ xử lý theo role
  ADMIN:   '/dashboard',
  DOCTOR:  '/dashboard',
  STAFF:   '/dashboard',
  PATIENT: '/dashboard',
  user:    '/dashboard',
  doctor:  '/dashboard',
  admin:   '/dashboard',
  staff:   '/dashboard',
};

/** Map lo_trinh path → /dashboard path (nội bộ) */
export const LO_TRINH_REDIRECTS = {
  '/admin/dashboard':  '/dashboard',
  '/admin/users':      '/dashboard/users',
  '/admin/doctors':    '/dashboard/doctors',
  '/admin/specialties':'/dashboard/specialties',
  '/admin/diseases':   '/dashboard/diseases',
  '/admin/medicines':  '/dashboard/medicines',
  '/admin/time-slots': '/dashboard/time-slots',
  '/admin/schedules':  '/dashboard/schedules',
  '/admin/payments':   '/dashboard/payments',
  '/doctor/dashboard': '/dashboard',
  '/doctor/schedules': '/dashboard/schedule',
  '/doctor/appointments': '/dashboard/patients',
  '/doctor/medical-records/create': '/dashboard/prescription',
  '/doctor/profile':   '/dashboard/profile',
  '/staff/dashboard':  '/dashboard',
  '/staff/appointments': '/dashboard/checkin',
  '/staff/book':       '/dashboard/book-patient',
  '/patient/dashboard':'/dashboard',
  '/patient/book':     '/doctors',
  '/patient/appointments': '/dashboard/bookings',
  '/patient/medical-records': '/dashboard/records',
  '/patient/profile':  '/dashboard/profile',
};

export function homeForBeRole(beRole) {
  return ROLE_HOME[beRole] || ROLE_HOME[BE_TO_FE_ROLE[beRole]] || '/dashboard';
}

export function homeForFeRole(feRole) {
  return ROLE_HOME[feRole] || '/dashboard';
}
