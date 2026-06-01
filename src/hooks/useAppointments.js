/**
 * Hooks liên quan đến lịch hẹn
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from '../api';

/* ── Bệnh nhân: lịch hẹn của tôi ── */
export function useMyAppointments(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments(params);
      setData(Array.isArray(res) ? res : res?.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const cancel = async (appointmentId) => {
    await cancelAppointment(appointmentId);
    await fetch(); // refresh
  };

  return { data, loading, error, refetch: fetch, cancel };
}

/* ── Bác sĩ: lịch hẹn của mình ── */
export function useDoctorAppointments(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDoctorAppointments(params);
      setData(Array.isArray(res) ? res : res?.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/* ── Admin/Staff: tất cả lịch hẹn ── */
export function useAllAppointments(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments(params);
      setData(Array.isArray(res) ? res : res?.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (appointmentId, status) => {
    await updateAppointmentStatus(appointmentId, status);
    await fetch();
  };

  return { data, loading, error, refetch: fetch, updateStatus };
}
