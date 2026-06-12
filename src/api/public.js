/**
 * publicApi — /public (Không cần token)
 * ──────────────────────────────────────────────────
 * GET /public/specialties                          → Specialty[]
 * GET /public/doctors?name=&specialtyId=           → DoctorResponseDTO[]
 * GET /public/schedules/available?doctorId=&date=  → ScheduleResponseDTO[]
 * GET /images/{fileName}                           → file ảnh (dùng trong <img src>)
 */
import api from './config';
import { unwrapList } from '../utils/apiHelpers';

export const getSpecialties = () =>
  api.get('/public/specialties');

export const getDoctors = (params = {}) =>
  api.get('/public/doctors', { params });

export const getAvailableSlots = ({ doctorId, date }) =>
  api.get('/public/schedules/available', { params: { doctorId, date } });

/** BE chưa có GET /public/doctors/{id} — tìm trong danh sách */
export async function getDoctorById(id) {
  const res = await getDoctors({});
  return unwrapList(res).find(d => String(d.id) === String(id)) ?? null;
}

export { unwrapList };
