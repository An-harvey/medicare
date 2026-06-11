package com.medicare.controller.patient;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.request.PatientProfileUpdateRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.dto.response.MedicalRecordDetailResponseDTO;
import com.medicare.dto.response.MedicalRecordResponseDTO;
import com.medicare.dto.response.PatientProfileResponseDTO;
import com.medicare.service.clinical.MedicalRecordService;
import com.medicare.service.identity.PatientProfileService;
import com.medicare.service.scheduling.AppointmentService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    //  Quản lý Hồ sơ cá nhân
    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponseDTO> getProfile() {
        return ResponseEntity.ok(patientProfileService.getPatientProfile());
    }

    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientProfileResponseDTO> updateProfile(
            @RequestPart("data") PatientProfileUpdateRequestDTO dto,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {
        return ResponseEntity.ok(patientProfileService.updatePatientProfile(dto, avatarFile));
    }

    // Quản lý Đặt lịch hẹn
    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@RequestBody AppointmentRequestDTO dto) {
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
}
