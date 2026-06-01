/**
 * Hook lấy danh sách bác sĩ với filter/search
 * Fallback về mockData khi chưa có backend
 */
import { useState, useEffect } from 'react';
import { getDoctors } from '../api';
import { doctors as mockDoctors } from '../data/mockData';

export function useDoctors(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDoctors(params)
      .then((res) => {
        if (!cancelled) {
          // BE trả về { content: [...] } (Page) hoặc array trực tiếp
          setData(Array.isArray(res) ? res : res?.content ?? res?.data ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback mock khi chưa có BE
          setData(mockDoctors);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}
