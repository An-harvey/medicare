/**
 * publicApi — /public (Không cần token)
 * ──────────────────────────────────────────────────
 * GET /public/specialties                          → Specialty[]
 * GET /public/doctors?name=&specialtyId=           → DoctorResponseDTO[]
 * GET /public/schedules/available?doctorId=&date=  → ScheduleResponseDTO[]
 * GET /images/{fileName}                           → file ảnh (dùng trong <img src>)
 *
 * NOTE: BE chưa có GET /public/doctors/{id}
 *       → dùng getDoctorById() bên dưới (filter từ danh sách)
 */
import api from './config';
import { unwrapList } from '../utils/apiHelpers';

export const getSpecialties = () =>
  api.get('/public/specialties');

export const getDoctors = (params = {}) =>
  api.get('/public/doctors', { params });

export const getAvailableSlots = ({ doctorId, date }) =>
  api.get('/public/schedules/available', { params: { doctorId, date } });

/**
 * getDoctorById — Lấy thông tin 1 bác sĩ theo id
 * BE chưa có GET /public/doctors/{id} → lấy danh sách rồi filter
 * @param {string|number} id
 * @returns {Promise<object|null>} raw DoctorResponseDTO hoặc null
 */
export async function getDoctorById(id) {
  const res = await getDoctors({});
  const list = unwrapList(res);
  return list.find(d => String(d.id) === String(id)) ?? null;
}

export { unwrapList };
