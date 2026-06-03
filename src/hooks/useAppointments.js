/**
 * useAppointments — Hooks lịch hẹn theo role
 * ─────────────────────────────────────────────
 *
 * ── PATIENT ──
 * useMyAppointments()
 *   GET /api/patient/appointments → AppointmentResponseDTO[]
 *   .cancel(id, reason) → PUT /api/patient/appointments/{id}/cancel?reason=
 *
 * useMyMedicalRecords()
 *   GET /api/patient/medical-records → MedicalRecordResponseDTO[]
 *
 * ── DOCTOR ──
 * useDoctorHistory()
 *   GET /api/doctor/appointments/history → AppointmentResponseDTO[]
 *
 * useDoctorStatistics()
 *   GET /api/doctor/statistics → { totalExaminedThisWeek, totalExaminedThisMonth, totalPendingAppointments }
 *
 * ── STAFF ──
 * useStaffAppointments(params)
 *   GET /api/staff/appointments?cccd=&date= → AppointmentResponseDTO[]
 *   .updateStatus(id, status) → PUT /api/staff/appointments/{id}/status?status=
 *
 * AppointmentResponseDTO:
 *   { appointmentId, patientName, doctorName, workDate, startTime, symptoms, status, cancelReason }
 * AppointmentStatus: PENDING | ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
 */
import { useState, useEffect, useCallback } from 'react';
import {
  patientGetAppointments,
  patientCancelAppointment,
  patientGetMedicalRecords,
} from '../api/patient';
import {
  doctorGetAppointmentHistory,
  doctorGetStatistics,
} from '../api/doctor';
import {
  staffSearchAppointments,
  staffUpdateAppointmentStatus,
} from '../api/staff';
import { todayISO } from '../utils/formatters';

/* ════════════ PATIENT: lịch hẹn của tôi ════════════ */
export function useMyAppointments() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientGetAppointments();
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e.message || 'Lỗi tải lịch hẹn');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Hủy lịch → PUT /api/patient/appointments/{id}/cancel?reason=
  const cancel = async (id, reason) => {
    await patientCancelAppointment(id, reason);
    await fetch(); // refresh
  };

  return { data, loading, error, refetch: fetch, cancel };
}

/* ════════════ PATIENT: hồ sơ bệnh án ═══════════════ */
export function useMyMedicalRecords() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    patientGetMedicalRecords()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/* ════════════ DOCTOR: lịch sử cuộc hẹn ═════════════ */
export function useDoctorHistory() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    doctorGetAppointmentHistory()
      .then(res => setData(Array.isArray(res) ? res : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/* ════════════ DOCTOR: thống kê hiệu suất ═══════════ */
export function useDoctorStatistics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    doctorGetStatistics()
      .then(res => setData(res))
      .catch(() => setData({ totalExaminedThisWeek: 0, totalExaminedThisMonth: 0, totalPendingAppointments: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/* ════════════ STAFF: tìm kiếm & cập nhật lịch hẹn ══ */
export function useStaffAppointments(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mặc định load lịch hẹn hôm nay nếu không có params
      const queryParams = Object.keys(params).length ? params : { date: todayISO() };
      const res = await staffSearchAppointments(queryParams);
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e.message || 'Lỗi tải lịch hẹn');
      setData([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  // PUT /api/staff/appointments/{id}/status?status=
  const updateStatus = async (id, status) => {
    await staffUpdateAppointmentStatus(id, status);
    await fetch(); // refresh
  };

  return { data, loading, error, refetch: fetch, updateStatus };
}
