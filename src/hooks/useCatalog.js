/**
 * useCatalog — Hooks lấy danh mục hệ thống
 * ─────────────────────────────────────────
 *
 * useSpecialties()  → GET /api/public/specialties   (public)
 *
 * useDiseases()     → thử theo thứ tự:
 *   1. GET /api/doctor/diseases   (nếu BE đã mở)
 *   2. GET /api/public/diseases   (nếu BE đã mở)
 *   3. GET /api/admin/diseases    (fallback, chỉ dùng được khi ADMIN token)
 *
 * useMedicines()    → thử theo thứ tự:
 *   1. GET /api/doctor/medicines  (nếu BE đã mở)
 *   2. GET /api/public/medicines  (nếu BE đã mở)
 *   3. GET /api/admin/medicines   (fallback, chỉ dùng được khi ADMIN token)
 */
import { useState, useEffect } from 'react';
import { getSpecialties } from '../api/public';
import { adminGetDiseases, adminGetMedicines, adminGetTimeSlots } from '../api/admin';
import api from '../api/config';

/* ── Thử nhiều endpoint theo thứ tự ưu tiên ── */
async function tryEndpoints(endpoints) {
  for (const { fn, transform } of endpoints) {
    try {
      const res = await fn();
      const raw = Array.isArray(res) ? res : (res?.content ?? []);
      return transform ? raw.map(transform) : raw;
    } catch {
      // thử endpoint tiếp theo
    }
  }
  return [];
}

/* Generic hook */
function useFetchList(fetchFn, fallback = []) {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(result => { if (!cancelled) setData(result); })
      .catch(e => {
        if (!cancelled) {
          setError(e?.message || 'Lỗi tải dữ liệu');
          setData(fallback);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}

/* ── Public: chuyên khoa ── */
export const useSpecialties = () =>
  useFetchList(() =>
    getSpecialties().then(res => {
      const raw = Array.isArray(res) ? res : [];
      return raw.map(s => ({ ...s, desc: s.description, icon: s.icon || '🏥' }));
    })
  );

/* ── Bệnh lý — thử doctor → public → admin ── */
const diseaseTransform = d => ({ id: d.id, code: d.code, name: d.name, description: d.description });

export const useDiseases = () =>
  useFetchList(() =>
    tryEndpoints([
      // 1. Doctor endpoint (khi BE bổ sung)
      { fn: () => api.get('/doctor/diseases', { params: { page: 0, size: 500 } }), transform: diseaseTransform },
      // 2. Public endpoint (khi BE bổ sung)
      { fn: () => api.get('/public/diseases', { params: { page: 0, size: 500 } }), transform: diseaseTransform },
      // 3. Admin endpoint (fallback — chỉ admin token mới dùng được)
      { fn: () => adminGetDiseases({ page: 0, size: 500 }), transform: diseaseTransform },
    ])
  );

/* ── Thuốc — thử doctor → public → admin ── */
const medicineTransform = m => ({
  id:           m.id,
  name:         m.name,
  unit:         m.unit,
  instructions: m.usageInstructions,
});

export const useMedicines = () =>
  useFetchList(() =>
    tryEndpoints([
      // 1. Doctor endpoint (khi BE bổ sung)
      { fn: () => api.get('/doctor/medicines', { params: { page: 0, size: 1000 } }), transform: medicineTransform },
      // 2. Public endpoint (khi BE bổ sung)
      { fn: () => api.get('/public/medicines', { params: { page: 0, size: 1000 } }), transform: medicineTransform },
      // 3. Admin endpoint (fallback)
      { fn: () => adminGetMedicines({ page: 0, size: 1000 }), transform: medicineTransform },
    ])
  );

/* ── Time slots ── */
export const useTimeSlots = () =>
  useFetchList(() =>
    adminGetTimeSlots().then(res => {
      const raw = Array.isArray(res) ? res : [];
      return raw.map(t => ({ id: t.id, startTime: t.startTime, status: t.status }));
    })
  );
