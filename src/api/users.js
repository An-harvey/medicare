/**
 * User / Profile API
 * DTO: UserCreateRequest, PatientProfileUpdateRequestDTO,
 *      DoctorProfileUpdateRequestDTO, AdminDoctorProfileUpdateRequestDTO
 */
import api from './config';

/* ─── Admin: quản lý tài khoản ─── */

/**
 * Tạo tài khoản Doctor hoặc Staff
 * @param {{ email, password, fullName, phone, cccd, roleName, specialtyId? }} data — UserCreateRequest
 */
export const adminCreateUser = (data) =>
  api.post('/admin/users', {
    email:       data.email,
    password:    data.password,
    fullName:    data.fullName,
    phone:       data.phone,
    cccd:        data.cccd,
    roleName:    data.roleName,           // 'DOCTOR' | 'STAFF'
    specialtyId: data.specialtyId ?? null,
  });

/**
 * Lấy danh sách tất cả user (admin)
 * @param {{ page?, size?, role?, keyword? }} params
 */
export const adminGetUsers = (params = {}) =>
  api.get('/admin/users', { params });

/**
 * Cập nhật hồ sơ chuyên môn bác sĩ (admin)
 * @param {string} doctorId
 * @param {{ academicTitle, degree, experienceYears }} data — AdminDoctorProfileUpdateRequestDTO
 */
export const adminUpdateDoctorProfile = (doctorId, data) =>
  api.put(`/admin/doctors/${doctorId}/profile`, {
    academicTitle:   data.academicTitle,
    degree:          data.degree,
    experienceYears: data.experienceYears,
  });

/**
 * Xóa tài khoản (admin)
 */
export const adminDeleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`);

/* ─── Patient: cập nhật hồ sơ cá nhân ─── */

/**
 * Cập nhật hồ sơ bệnh nhân
 * @param {{ dob, bloodType, allergyHistory, personalMedicalHistory, familyMedicalHistory, imageUrl }} data
 *        — PatientProfileUpdateRequestDTO
 *        dob format: "yyyy-MM-dd"
 */
export const updatePatientProfile = (data) =>
  api.put('/patients/profile', {
    dob:                    data.dob,
    bloodType:              data.bloodType,
    allergyHistory:         data.allergyHistory,
    personalMedicalHistory: data.personalMedicalHistory,
    familyMedicalHistory:   data.familyMedicalHistory,
    imageUrl:               data.imageUrl,
  });

/**
 * Lấy hồ sơ bệnh nhân hiện tại
 */
export const getPatientProfile = () => api.get('/patients/profile');

/* ─── Doctor: cập nhật hồ sơ cá nhân ─── */

/**
 * Bác sĩ tự cập nhật thông tin cá nhân
 * @param {{ imageUrl, expertiseDescription, biography }} data — DoctorProfileUpdateRequestDTO
 */
export const updateDoctorProfile = (data) =>
  api.put('/doctors/profile', {
    imageUrl:               data.imageUrl,
    expertiseDescription:   data.expertiseDescription,
    biography:              data.biography,
  });

/**
 * Lấy hồ sơ bác sĩ hiện tại
 */
export const getDoctorProfile = () => api.get('/doctors/profile');

/**
 * Lấy danh sách bác sĩ (public)
 * @param {{ specialtyId?, keyword?, page?, size? }} params
 */
export const getDoctors = (params = {}) =>
  api.get('/doctors', { params });

/**
 * Lấy chi tiết một bác sĩ (public)
 */
export const getDoctorById = (doctorId) =>
  api.get(`/doctors/${doctorId}`);
