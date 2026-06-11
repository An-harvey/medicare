package com.medicare.controller.doctor;

import com.medicare.dto.request.DoctorProfileUpdateRequestDTO;
import com.medicare.dto.request.MedicalRecordCreateRequestDTO;
import com.medicare.dto.request.MedicalRecordUpdateRequestDTO;
import com.medicare.dto.response.*;
import com.medicare.enums.AppointmentStatus;
import com.medicare.service.clinical.MedicalRecordService;
import com.medicare.service.identity.DoctorProfileService;
import com.medicare.service.identity.PatientProfileService;
import com.medicare.service.scheduling.AppointmentService;
import com.medicare.service.scheduling.ScheduleService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorProfileService doctorProfileService;
    private final ScheduleService scheduleService;
    private final AppointmentService appointmentService;
    private final MedicalRecordService medicalRecordService;
    private final PatientProfileService patientProfileService;

    //  Quản lý hồ sơ chuyên môn (Chỉ sửa ảnh, thế mạnh, tiểu sử)
    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DoctorDetailResponseDTO> updateProfile(
            @RequestPart("dto") DoctorProfileUpdateRequestDTO dto,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {
        return ResponseEntity.ok(doctorProfileService.doctorUpdateProfile(dto, avatarFile));
    }

    //  Xem lịch làm việc theo ngày
    @GetMapping("/schedules")
    public ResponseEntity<List<ScheduleResponseDTO>> getMySchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(scheduleService.getDoctorSchedulesByDate(doctorId, date));
    }

    //  Nghiệp vụ Cuộc hẹn & Khám bệnh
    @GetMapping("/appointments/history")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentHistory() {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(appointmentService.getDoctorAppointmentHistory(doctorId));
    }

    @GetMapping("/appointments/upcoming")
    public ResponseEntity<List<AppointmentResponseDTO>> getUpcomingAppointments() {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(appointmentService.getDoctorUpcomingAppointments(doctorId));
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Void> updateAppointmentStatus(@PathVariable UUID id, @RequestParam AppointmentStatus status) {
        appointmentService.doctorUpdateAppointmentStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/medical-records")
    public ResponseEntity<MedicalRecordResponseDTO> createMedicalRecord(@RequestBody MedicalRecordCreateRequestDTO dto) {
        MedicalRecordResponseDTO response = medicalRecordService.createMedicalRecord(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/medical-records")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMyMedicalRecords() {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(medicalRecordService.getDoctorMedicalRecords(doctorId));
    }

    @GetMapping("/medical-records/{id}")
    public ResponseEntity<MedicalRecordResponseDTO> getMedicalRecordDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordDetails(id));
    }

    @PutMapping("/medical-records/{id}")
    public ResponseEntity<MedicalRecordResponseDTO> updateMedicalRecord(@PathVariable UUID id, @RequestBody MedicalRecordUpdateRequestDTO dto) {
        return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(id, dto));
    }

    @GetMapping("/patients/{id}/profile")
    public ResponseEntity<PatientProfileResponseDTO> getPatientProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(patientProfileService.getPatientProfileForDoctor(id));
    }

    //  Báo cáo thống kê hiệu suất
    @GetMapping("/statistics")
    public ResponseEntity<DoctorStatisticsResponseDTO> getStatistics() {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(appointmentService.getDoctorStatistics(doctorId));
    }
}
