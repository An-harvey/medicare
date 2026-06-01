/**
 * Hooks cho danh mục: specialties, diseases, medicines, timeSlots
 * Fallback về mockData khi chưa có BE
 */
import { useState, useEffect } from 'react';
import { getSpecialties, getDiseases, getMedicines, getTimeSlots } from '../api';
import { specialties as mockSpecialties } from '../data/mockData';

function useCatalogList(apiFn, fallback = []) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFn()
      .then((res) => {
        if (!cancelled) setData(Array.isArray(res) ? res : res?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setData(fallback);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}

export const useSpecialties = () => useCatalogList(getSpecialties, mockSpecialties);
export const useDiseases    = () => useCatalogList(getDiseases);
export const useMedicines   = () => useCatalogList(getMedicines);
export const useTimeSlots   = () => useCatalogList(getTimeSlots);
