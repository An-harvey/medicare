/**
 * useCatalog — Hooks lấy danh mục hệ thống
 * ─────────────────────────────────────────
 *
 * useSpecialties()  → GET /api/public/specialties   (không cần token)
 *   Response: Specialty[] [{id, name, description}]
 *
 * useDiseases(params)  → GET /api/admin/diseases    (cần ADMIN token)
 *   Response: Page<DiseaseResponseDTO> → dùng content[]
 *   {id, code, name, description}
 *
 * useMedicines(params) → GET /api/admin/medicines   (cần ADMIN token)
 *   Response: Page<MedicineResponseDTO> → dùng content[]
 *   {id, name, unit, usageInstructions}
 *
 * useTimeSlots()       → GET /api/admin/time-slots  (cần ADMIN token)
 *   Response: TimeSlotResponseDTO[] [{id, startTime, status}]
 *
 * Fallback: mock data khi BE chưa chạy hoặc lỗi network
 */
import { useState, useEffect } from 'react';
import { getSpecialties }  from '../api/public';
import {
  adminGetDiseases,
  adminGetMedicines,
  adminGetTimeSlots,
} from '../api/admin';

/* Generic fetch helper */
function useFetchList(apiFn, transform, fallback = []) {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFn()
      .then(res => {
        if (cancelled) return;
        // Hỗ trợ cả List trực tiếp và Page wrapper
        const raw = Array.isArray(res) ? res : res?.content ?? [];
        setData(transform ? raw.map(transform) : raw);
      })
      .catch(() => { if (!cancelled) setData(fallback); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}

/* ── Public: chuyên khoa (không cần token) ── */
export const useSpecialties = () =>
  useFetchList(
    getSpecialties,
    // Normalize: BE trả { id: Integer, name, description }
    // Mock dùng { id: 'cardiology', name, icon, desc } — giữ nguyên cả 2
    s => ({ ...s, desc: s.description, icon: s.icon || '🏥' }),
    [],
  );

/* ── Admin: danh mục bệnh lý ── */
export const useDiseases = () =>
  useFetchList(
    () => adminGetDiseases({ page: 0, size: 500 }),
    d => ({ id: d.id, code: d.code, name: d.name, description: d.description }),
    [],
  );

/* ── Admin/Doctor: danh mục thuốc ── */
export const useMedicines = () =>
  useFetchList(
    () => adminGetMedicines({ page: 0, size: 1000 }),
    m => ({
      id:           m.id,
      name:         m.name,
      unit:         m.unit,
      instructions: m.usageInstructions,
    }),
    [],
  );

/* ── Admin: time slots ── */
export const useTimeSlots = () =>
  useFetchList(
    adminGetTimeSlots,
    t => ({ id: t.id, startTime: t.startTime, status: t.status }),
    [],
  );
