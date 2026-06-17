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
 * AppointmentStatus: PENDING | CONFIRMED | CHECK_IN | IN_PROGRESS | COMPLETED | CANCELLED
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
  doctorGetUpcomingAppointments,
  doctorUpdateAppointmentStatus,
} from '../api/doctor';import {
  staffSearchAppointments,
  staffGetPendingAppointments,
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

  // Refetch khi user quay lại tab (sau khi bác sĩ cập nhật trạng thái)
  useEffect(() => {
    const onFocus = () => fetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetch]);

  const cancel = async (id, reason) => {
    await patientCancelAppointment(id, reason);
    await fetch();
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
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorGetAppointmentHistory();
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e.message || 'Lỗi tải lịch hẹn');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/* ════════════ DOCTOR: lịch hẹn sắp tới (cần khám) ═════════════ */
export function useDoctorUpcoming() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Sort order: CHECK_IN (đã đến) > IN_PROGRESS (đang khám) > PENDING > CONFIRMED
  const SORT_ORDER = { CHECK_IN: 0, IN_PROGRESS: 1, PENDING: 2, CONFIRMED: 3 };
  // Tất cả status bác sĩ cần thấy
  const ACTIVE = new Set(['PENDING', 'CONFIRMED', 'CHECK_IN', 'IN_PROGRESS']);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorGetUpcomingAppointments();
      const all = Array.isArray(res) ? res : [];
      // Giữ lại tất cả active (BE có thể trả thêm IN_PROGRESS)
      // Nếu BE chỉ trả PENDING+CHECK_IN, vẫn đúng
      const active = all.filter(a => ACTIVE.has(a.status));
      const sorted = [...active].sort((a, b) =>
        (SORT_ORDER[a.status] ?? 9) - (SORT_ORDER[b.status] ?? 9)
      );
      setData(sorted);
    } catch (e) {
      // Fallback: nếu /upcoming 404/405 → dùng /history filter FE
      if (e?.status === 404 || e?.status === 405) {
        try {
          const res2 = await doctorGetAppointmentHistory();
          const active = (Array.isArray(res2) ? res2 : [])
            .filter(a => ACTIVE.has(a.status))
            .sort((a, b) => (SORT_ORDER[a.status] ?? 9) - (SORT_ORDER[b.status] ?? 9));
          setData(active);
        } catch {
          setData([]);
          setError('Không thể tải danh sách chờ khám');
        }
      } else {
        setError(e?.message || 'Lỗi tải danh sách chờ khám');
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, status) => {
    await doctorUpdateAppointmentStatus(id, status);
    await fetch();
  };

  return { data, loading, error, refetch: fetch, updateStatus };
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

/* ════════════ STAFF: lịch hẹn chờ xác nhận (PENDING) ══ */
/**
 * useStaffPendingAppointments
 * GET /api/staff/appointments/pending → AppointmentResponseDTO[]
 * Toàn bộ PENDING trên hệ thống, sắp theo ngày khám tăng dần
 * Dùng cho StaffDashboard: hiển thị ngay khi vào ca mà không cần nhập CCCD/ngày
 */
export function useStaffPendingAppointments() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffGetPendingAppointments();
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e?.message || 'Lỗi tải danh sách chờ xác nhận');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const confirmAppointment = async (id) => {
    await staffUpdateAppointmentStatus(id, 'CONFIRMED');
    await fetch();
  };

  return { data, loading, error, refetch: fetch, confirmAppointment };
}
