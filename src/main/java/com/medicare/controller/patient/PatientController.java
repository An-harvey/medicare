package com.medicare.controller.patient;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.request.PatientProfileUpdateRequestDTO;
import com.medicare.dto.response.*;
import com.medicare.enums.PaymentStatus;
import com.medicare.service.billing.PaymentService;
import com.medicare.service.clinical.MedicalRecordService;
import com.medicare.service.identity.PatientProfileService;
import com.medicare.service.scheduling.AppointmentService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')") // Bắt buộc Token phải có quyền PATIENT
@RequiredArgsConstructor
public class PatientController {

    private final PatientProfileService patientProfileService;
    private final AppointmentService appointmentService;
    private final MedicalRecordService medicalRecordService;
    private final PaymentService paymentService;

    //  Quản lý Hồ sơ cá nhân
    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponseDTO> getProfile() {
        return ResponseEntity.ok(patientProfileService.getPatientProfile());
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientProfileResponseDTO> updateProfile(
            @RequestPart("data") PatientProfileUpdateRequestDTO dto,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {
        return ResponseEntity.ok(patientProfileService.updatePatientProfile(dto, avatarFile));
    }

    // Quản lý Đặt lịch hẹn
    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@Validated @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO response = appointmentService.patientBookAppointment(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED); // Trả về 201 Created
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentHistory() {
        UUID currentPatientId = SecurityUtils.getCurrentUserId(); // Lấy ID an toàn từ Token
        return ResponseEntity.ok(appointmentService.getPatientAppointmentHistory(currentPatientId));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<String> cancelAppointment(
            @PathVariable UUID id,
            @RequestParam String reason) {
        appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok("Đã hủy lịch hẹn thành công.");
    }

    //  Quản lý Bệnh án và Đơn thuốc
    @GetMapping("/medical-records")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMedicalRecords() {
        UUID currentPatientId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(medicalRecordService.getPatientRecords(currentPatientId));
    }

    @GetMapping("/medical-records/{id}")
    public ResponseEntity<MedicalRecordDetailResponseDTO> getMedicalRecordDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecordDetails(id));
    }

    // Quản lý thanh toán
    @GetMapping("/payments")
    public ResponseEntity<Page<PaymentResponseDTO>> getPaymentHistory(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", defaultValue = "DESC") String direction
    ) {
        // Lấy ID bệnh nhân hiện tại
        UUID currentPatientId = SecurityUtils.getCurrentUserId();

        // Cấu hình sắp xếp và phân trang (Mặc định xếp theo id)
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Trả về kết quả phân trang
        return ResponseEntity.ok(paymentService.getPatientPaymentHistory(currentPatientId, status, pageable));
    }

}
