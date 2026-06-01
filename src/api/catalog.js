/**
 * Catalog / Danh mục hệ thống API
 * DTO: SpecialtyRequestDTO, DiseaseRequestDTO, MedicineRequestDTO, TimeSlotRequestDTO
 */
import api from './config';

/* ─── Specialties (Chuyên khoa) ─── */

/** Lấy danh sách chuyên khoa (public) */
export const getSpecialties = () => api.get('/specialties');

/**
 * Admin tạo chuyên khoa mới
 * @param {{ name: string, description: string }} data — SpecialtyRequestDTO
 */
export const createSpecialty = (data) =>
  api.post('/admin/specialties', {
    name:        data.name,
    description: data.description,
  });

/**
 * Admin cập nhật chuyên khoa
 */
export const updateSpecialty = (specialtyId, data) =>
  api.put(`/admin/specialties/${specialtyId}`, {
    name:        data.name,
    description: data.description,
  });

/** Admin xóa chuyên khoa */
export const deleteSpecialty = (specialtyId) =>
  api.delete(`/admin/specialties/${specialtyId}`);

/* ─── Diseases (Danh mục bệnh lý) ─── */

/** Lấy danh sách bệnh lý */
export const getDiseases = (params = {}) =>
  api.get('/diseases', { params });

/**
 * Admin tạo bệnh lý mới
 * @param {{ name: string, icdCode?: string, description?: string }} data — DiseaseRequestDTO
 */
export const createDisease = (data) =>
  api.post('/admin/diseases', data);

/** Admin cập nhật bệnh lý */
export const updateDisease = (diseaseId, data) =>
  api.put(`/admin/diseases/${diseaseId}`, data);

/** Admin xóa bệnh lý */
export const deleteDisease = (diseaseId) =>
  api.delete(`/admin/diseases/${diseaseId}`);

/* ─── Medicines (Danh mục thuốc) ─── */

/** Lấy danh sách thuốc (dùng cho kê đơn) */
export const getMedicines = (params = {}) =>
  api.get('/medicines', { params });

/**
 * Admin tạo thuốc mới
 * @param {{ name: string, unit?: string, description?: string }} data — MedicineRequestDTO
 */
export const createMedicine = (data) =>
  api.post('/admin/medicines', data);

/** Admin cập nhật thuốc */
export const updateMedicine = (medicineId, data) =>
  api.put(`/admin/medicines/${medicineId}`, data);

/** Admin xóa thuốc */
export const deleteMedicine = (medicineId) =>
  api.delete(`/admin/medicines/${medicineId}`);

/* ─── Time Slots (Khung giờ khám) ─── */

/** Lấy danh sách time slot mặc định */
export const getTimeSlots = () => api.get('/time-slots');

/**
 * Admin tạo khung giờ mới
 * @param {{ startTime: string, endTime: string, label?: string }} data — TimeSlotRequestDTO
 *        startTime/endTime format: "HH:mm"
 */
export const createTimeSlot = (data) =>
  api.post('/admin/time-slots', {
    startTime: data.startTime,
    endTime:   data.endTime,
    label:     data.label,
  });

/** Admin xóa khung giờ */
export const deleteTimeSlot = (timeSlotId) =>
  api.delete(`/admin/time-slots/${timeSlotId}`);
