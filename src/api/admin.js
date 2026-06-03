/**
 * adminApi — /api/admin  (Role: ADMIN)
 * ──────────────────────────────────────────────────────────────────
 *
 * ── CHUYÊN KHOA ──
 *  7.  POST   /admin/specialties         → SpecialtyResponseDTO (201)
 *  8.  DELETE /admin/specialties/{id}    → 204
 *
 * ── BỆNH LÝ (ICD) ──
 *  9.  GET    /admin/diseases?keyword=&page=&size=&sortBy=code&direction=ASC
 *             → Page<DiseaseResponseDTO> { content:[{id,code,name,description}], totalElements, totalPages }
 *  10. POST   /admin/diseases            → Disease
 *  11. PUT    /admin/diseases/{id}       → Disease
 *
 * ── THUỐC ──
 *  12. GET    /admin/medicines?keyword=&page=&size=&sortBy=name
 *             → Page<MedicineResponseDTO> { content:[{id,name,unit,usageInstructions}] }
 *  13. POST   /admin/medicines           → Medicine
 *
 * ── USERS ──
 *  14. GET    /admin/users?keyword=&roleId=&page=&size=&sortBy=fullName
 *             → Page<UserResponseDTO> { content:[{id,email,fullName,phone,cccd,isActive,roleId,roleName}] }
 *  15. POST   /admin/users (DOCTOR/STAFF) → String "Khởi tạo tài khoản thành công. ID: <uuid>" (201)
 *  17. PUT    /admin/users/{id}/status?isActive=true/false → String
 *
 * ── BÁC SĨ (học hàm) ──
 *  18. PUT    /admin/doctors/{id}/academic-info → DoctorDetailResponseDTO
 *
 * ── TIME SLOTS ──
 *  19. POST   /admin/time-slots          → TimeSlot (201)
 *  20. GET    /admin/time-slots          → TimeSlotResponseDTO[] [{id,startTime,status}]
 *
 * ── LỊCH LÀM VIỆC ──
 *  21. POST   /admin/schedules           → ScheduleResponseDTO (201)
 *  22. GET    /admin/schedules?doctorId=&workDate=&specialtyId=&page=&size=
 *             → Page<ScheduleResponseDTO>
 *
 * ── THANH TOÁN ──
 *  23. GET    /admin/payments            → PaymentResponseDTO[]
 */
import api from './config';

/* ════════════════════ CHUYÊN KHOA ════════════════════ */
export const adminCreateSpecialty = (data) =>
  api.post('/admin/specialties', { name: data.name, description: data.description });

export const adminDeleteSpecialty = (id) =>
  api.delete(`/admin/specialties/${id}`);

/* ════════════════════ BỆNH LÝ ════════════════════════ */
export const adminGetDiseases = (params = {}) =>
  api.get('/admin/diseases', { params });   // { keyword, page, size, sortBy, direction }

export const adminCreateDisease = (data) =>
  api.post('/admin/diseases', { code: data.code, name: data.name, description: data.description });

export const adminUpdateDisease = (id, data) =>
  api.put(`/admin/diseases/${id}`, { code: data.code, name: data.name, description: data.description });

/* ════════════════════ THUỐC ══════════════════════════ */
export const adminGetMedicines = (params = {}) =>
  api.get('/admin/medicines', { params });  // { keyword, page, size, sortBy, direction }

export const adminCreateMedicine = (data) =>
  api.post('/admin/medicines', {
    name:              data.name,
    unit:              data.unit,
    usageInstructions: data.usageInstructions,
  });

/* ════════════════════ USERS ══════════════════════════ */
// GET users — Page<UserResponseDTO>
export const adminGetUsers = (params = {}) =>
  api.get('/admin/users', { params }); // { keyword, roleId, page, size, sortBy, direction }

// POST tạo tài khoản Doctor hoặc Staff
export const adminCreateUser = (data) =>
  api.post('/admin/users', {
    email:       data.email,
    password:    data.password,
    fullName:    data.fullName,
    phone:       data.phone,
    cccd:        data.cccd,
    roleName:    data.roleName,          // "DOCTOR" | "STAFF"
    specialtyId: data.specialtyId ?? null,
  });

// PUT toggle active/inactive
export const adminToggleUserStatus = (id, isActive) =>
  api.put(`/admin/users/${id}/status`, null, { params: { isActive } });

/* ════════════════════ BÁC SĨ (học hàm) ═══════════════ */
export const adminUpdateDoctorAcademic = (id, data) =>
  api.put(`/admin/doctors/${id}/academic-info`, {
    academicTitle:   data.academicTitle,
    degree:          data.degree,
    experienceYears: data.experienceYears,
  });

/* ════════════════════ TIME SLOTS ═════════════════════ */
export const adminGetTimeSlots = () =>
  api.get('/admin/time-slots');

export const adminCreateTimeSlot = (data) =>
  api.post('/admin/time-slots', {
    startTime: data.startTime, // "HH:mm:ss"
    status:    data.status ?? true,
  });

/* ════════════════════ LỊCH LÀM VIỆC ═════════════════ */
// GET schedules — Page<ScheduleResponseDTO>
export const adminGetSchedules = (params = {}) =>
  api.get('/admin/schedules', { params }); // { doctorId, workDate, specialtyId, page, size, sortBy, direction }

// POST tạo lịch cho bác sĩ
export const adminCreateSchedule = (data) =>
  api.post('/admin/schedules', {
    doctorId:    data.doctorId,
    workDate:    data.workDate,    // "yyyy-MM-dd"
    timeSlotId:  data.timeSlotId,
    maxPatients: data.maxPatients,
  });

/* ════════════════════ THANH TOÁN ══════════════════════ */
export const adminGetPayments = () =>
  api.get('/admin/payments');
