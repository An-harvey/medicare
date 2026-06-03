/**
 * useDoctors — Lấy danh sách bác sĩ từ public API
 * ──────────────────────────────────────────────────
 * GET /api/public/doctors?name=&specialtyId=
 * Response: DoctorResponseDTO[]
 *   { id, fullName, imageUrl, academicTitle, specialtyName, experienceYears }
 *
 * Ảnh: GET http://localhost:8080/api/images/{imageUrl}
 * Fallback: mockData khi BE chưa chạy
 */
import { useState, useEffect } from 'react';
import { getDoctors } from '../api/public';
import { mapDoctorFromApi } from '../utils/doctorMapper';

export function useDoctors(params = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Chỉ gửi specialtyId nếu là số nguyên (BE dùng Integer, mock dùng string)
    const beParams = { ...params };
    if (beParams.specialtyId && isNaN(Number(beParams.specialtyId))) {
      delete beParams.specialtyId;
    } else if (beParams.specialtyId) {
      beParams.specialtyId = Number(beParams.specialtyId);
    }

    getDoctors(beParams)
      .then(res => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.content ?? [];
        setData(list.map(mapDoctorFromApi).filter(Boolean));
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || 'Không thể kết nối server');
          setData([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}
