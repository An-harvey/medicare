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

export const adminUpdateSpecialty = (id, data) =>
  api.patch(`/admin/specialties/${id}`, { name: data.name, description: data.description });

/* ════════════════════ BỆNH LÝ ════════════════════════ */
export const adminGetDiseases = (params = {}) =>
  api.get('/admin/diseases', { params });   // { keyword, page, size, sortBy, direction }

export const adminCreateDisease = (data) =>
  api.post('/admin/diseases', { code: data.code, name: data.name, description: data.description });

export const adminUpdateDisease = (id, data) =>
  api.put(`/admin/diseases/${id}`, { code: data.code, name: data.name, description: data.description });

export const adminDeleteDisease = (id) =>
  api.delete(`/admin/diseases/${id}`);

/* ════════════════════ THUỐC ══════════════════════════ */
export const adminGetMedicines = (params = {}) =>
  api.get('/admin/medicines', { params });

export const adminCreateMedicine = (data) =>
  api.post('/admin/medicines', {
    name:              data.name,
    unit:              data.unit,
    usageInstructions: data.usageInstructions,
  });

// ── Nếu BE chưa có PUT/DELETE → FE hiển thị nút nhưng gọi cùng POST để tạo lại
// Khi BE bổ sung: PUT /admin/medicines/{id} & DELETE /admin/medicines/{id}
export const adminUpdateMedicine = (id, data) =>
  api.patch(`/admin/medicines/${id}`, {
    name:              data.name,
    unit:              data.unit,
    usageInstructions: data.usageInstructions,
  });

export const adminDeleteMedicine = (id) =>
  api.delete(`/admin/medicines/${id}`);

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
    startTime: data.startTime,
    status:    data.status ?? true,
  });

export const adminUpdateTimeSlot = (id, data) =>
  api.patch(`/admin/time-slots/${id}`, {
    startTime: data.startTime,
    status:    data.status ?? true,
  });

// Khi BE bổ sung: DELETE /admin/time-slots/{id}
export const adminDeleteTimeSlot = (id) =>
  api.delete(`/admin/time-slots/${id}`);

/* ════════════════════ LỊCH LÀM VIỆC ═════════════════ */
export const adminGetSchedules = (params = {}) =>
  api.get('/admin/schedules', { params });

export const adminCreateSchedule = (data) =>
  api.post('/admin/schedules', {
    doctorId:    data.doctorId,
    workDate:    data.workDate,
    timeSlotId:  data.timeSlotId,
    maxPatients: data.maxPatients,
  });

export const adminUpdateSchedule = (id, data) =>
  api.patch(`/admin/schedules/${id}`, {
    maxPatients: data.maxPatients,
    status:      data.status,
  });

// Khi BE bổ sung: DELETE /admin/schedules/{id}
export const adminDeleteSchedule = (id) =>
  api.delete(`/admin/schedules/${id}`);

/* ════════════════════ THANH TOÁN ══════════════════════ */
export const adminGetPayments = () =>
  api.get('/admin/payments');

/* ── Admin Dashboard — lo_trinh.txt §13.2 ── */
export const adminGetDashboardKpi = () =>
  api.get('/admin/dashboard/kpi-summary');

export const adminGetDashboardRevenue = (year = 0) =>
  api.get('/admin/dashboard/revenue', { params: { year } });

export const adminGetDashboardTopDoctors = (month = 0, year = 0) =>
  api.get('/admin/dashboard/top-doctors', { params: { month, year } });

export const adminGetDashboardSpecialtyStats = (month = 0) =>
  api.get('/admin/dashboard/specialties', { params: { month } });

export const adminGetDashboardAlerts = () =>
  api.get('/admin/dashboard/alerts');

export const adminGetDashboardActivities = () =>
  api.get('/admin/dashboard/activities/today');
