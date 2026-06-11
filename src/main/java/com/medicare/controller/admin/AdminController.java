package com.medicare.controller.admin;

import com.medicare.dto.request.*;
import com.medicare.dto.response.*;
import com.medicare.entity.Medicine;
import com.medicare.service.billing.PaymentService;
import com.medicare.service.catalog.DiseaseService;
import com.medicare.service.catalog.MedicineService;
import com.medicare.service.catalog.SpecialtyService;
import com.medicare.service.catalog.TimeSlotService;
import com.medicare.service.identity.DoctorProfileService;
import com.medicare.service.identity.UserService;
import com.medicare.service.scheduling.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final SpecialtyService specialtyService;
    private final DiseaseService diseaseService;
    private final MedicineService medicineService;
    private final UserService userService;
    private final DoctorProfileService doctorProfileService;
    private final TimeSlotService timeSlotService;
    private final ScheduleService scheduleService;
    private final PaymentService paymentService;

    // =================QUẢN LÝ DANH MỤC CHUYÊN KHOA====================
    //Tạo mới chuyên khoa ( specialties)
    @PostMapping("/specialties")
    public ResponseEntity<SpecialtyResponseDTO> createSpecialty(@RequestBody SpecialtyRequestDTO request) {
        return new ResponseEntity<>(specialtyService.createSpecialty(request), HttpStatus.CREATED);
    }

    // Xóa chuyên khoa theo {id}
    @DeleteMapping("/specialties/{id}")
    public ResponseEntity<Void> deleteSpecialty(@PathVariable Integer id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.noContent().build();
    }

    // Sửa nội dung mô tả chuyên khoa
    @PatchMapping("specialties/{id}")
    public ResponseEntity<SpecialtyResponseDTO> updateSpecialty(
            @PathVariable Integer id,
            @RequestBody SpecialtyRequestDTO request
            ){
        return ResponseEntity.ok(specialtyService.updateSpecialty(id, request));
    }

    //====================QUẢN LÝ DANH MỤC BỆNH LÝ (ICD)====================

    @GetMapping("/diseases")
    public ResponseEntity<Page<DiseaseResponseDTO>> getAllDiseases(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "code") String sortBy,
            @RequestParam(value = "direction", defaultValue = "ASC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(diseaseService.getAllDiseases(keyword, pageable));
    }

    @PostMapping("/diseases")
    public ResponseEntity<DiseaseResponseDTO> createDisease(@RequestBody DiseaseRequestDTO request ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(diseaseService.createDisease(request));
    }

    @PutMapping("/diseases/{id}")
    public ResponseEntity<DiseaseResponseDTO> updateDisease( @PathVariable Integer id, @RequestBody DiseaseRequestDTO request) {
        return ResponseEntity.ok(diseaseService.updateDisease(id, request));
    }

    @DeleteMapping("/diseases/{id}")
    public ResponseEntity<Void> deleteDisease(@PathVariable Integer id){
        diseaseService.deleteDisease(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================QUẢN LÝ DANH MỤC THUỐC===========================
    @GetMapping("/medicines")
    public ResponseEntity<Page<MedicineResponseDTO>> getAllMedicines(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "direction", defaultValue = "ASC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(medicineService.getAllMedicines(keyword, pageable));
    }

    @PostMapping("/medicines")
    public ResponseEntity<Medicine> createMedicine(@RequestBody Medicine medicine) {
        return new ResponseEntity<>(medicineService.createMedicine(medicine), HttpStatus.CREATED);
    }

    @PatchMapping("medicines/{id}")
    public ResponseEntity<MedicineResponseDTO> updateMedicine(@Validated @PathVariable Integer id,
                                                              @RequestBody MedicineRequestDTO request ){
        return ResponseEntity.ok(medicineService.updateMedicine(id, request));
    }

    @DeleteMapping("/medicines/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Integer id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }

    // ===========================QUẢN LÝ NHÂN SỰ (USERS & DOCTORS/STAFF)===============================
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "roleId", required = false) Integer roleId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "fullName") String sortBy,
            @RequestParam(value = "direction", defaultValue = "ASC") String direction
    ) {
        // Tạo đối tượng phân trang và sắp xếp dữ liệu động
        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponseDTO> result = userService.getAllUsers(keyword, roleId, pageable);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/users")
    public ResponseEntity<String> createUser(@RequestBody UserCreateRequestDTO dto) {
        UUID userId = userService.createUserAccount(dto);
        return new ResponseEntity<>("Khởi tạo tài khoản thành công. ID: " + userId, HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable UUID id, @RequestParam Boolean isActive) {
        userService.toggleUserStatus(id, isActive);
        return ResponseEntity.ok("Đã cập nhật trạng thái hoạt động của tài khoản.");
    }

    @PutMapping("/doctors/{id}/academic-info")
    public ResponseEntity<DoctorDetailResponseDTO> updateDoctorAcademicInfo(
            @PathVariable UUID id,
            @RequestBody AdminDoctorProfileUpdateRequestDTO dto) {
        return ResponseEntity.ok(doctorProfileService.adminUpdateAcademicInfo(id, dto));
    }

    // =======================QUẢN LÝ KHUNG GIỜ (TimeSlot ========================

    @PostMapping("/time-slots")
    public ResponseEntity<TimeSlotResponseDTO> createTimeSlot(@RequestBody TimeSlotRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeSlotService.createTimeSlot(request));
    }

    @GetMapping("/time-slots")
    public ResponseEntity<List<TimeSlotResponseDTO>> getAllTimeSlots() {
        return ResponseEntity.ok(timeSlotService.getAllTimeSlotsForAdmin());
    }

    @DeleteMapping("/time-slots/{id}")
    public ResponseEntity<Void> deleteTimeSlot(
            @PathVariable Integer id
            ){
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping ("/time-slots/{id}")
    public ResponseEntity<TimeSlotResponseDTO> updateTimeSlot(@PathVariable Integer id,
                                                              @RequestBody TimeSlotRequestDTO request){
        return ResponseEntity.ok(timeSlotService.updateTimeSlot(id, request));
    }

    //==============================Xếp lịch làm việc=======================================

    // API: GET /api/admin/schedules (Xem danh sách lịch hẹn toàn hệ thống )
    @GetMapping("/schedules")
    public ResponseEntity<Page<ScheduleResponseDTO>> getAllSchedules(
            @RequestParam(value = "doctorId", required = false) UUID doctorId,
            @RequestParam(value = "workDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate,
            @RequestParam(value = "specialtyId", required = false) Integer specialtyId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "workDate") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction
    ) {
        // Cấu hình phân trang và sắp xếp dựa trên Entity properties
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ScheduleResponseDTO> result = scheduleService.getAllSchedules(doctorId, workDate, specialtyId, pageable);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/schedules")
    public ResponseEntity<ScheduleResponseDTO> createSchedule(@RequestBody ScheduleCreateRequestDTO dto) {
        return new ResponseEntity<>(scheduleService.createSchedule(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/schedules/{id}")
    public ResponseEntity<ScheduleResponseDTO> updateSchedule(
            @PathVariable UUID id,
            @RequestBody ScheduleUpdateRequestDTO dto) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, dto));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    //============================== QUẢN LÝ TÀI CHÍNH / THANH TOÁN================================
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponseDTO>> getPaidServices() {
        return ResponseEntity.ok(paymentService.getAllPaidServices());
    }

}