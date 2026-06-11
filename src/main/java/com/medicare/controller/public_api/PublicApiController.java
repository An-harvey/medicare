package com.medicare.controller.public_api;

import com.medicare.dto.response.DoctorResponseDTO;
import com.medicare.dto.response.ScheduleResponseDTO;
import com.medicare.entity.Specialty;
import com.medicare.entity.Specialty;
import com.medicare.service.catalog.SpecialtyService;
import com.medicare.service.identity.DoctorProfileService;
import com.medicare.service.scheduling.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicApiController {

    private final SpecialtyService specialtyService;
    private final DoctorProfileService doctorProfileService;
    private final ScheduleService scheduleService;

    // GET /api/public/specialties : Lấy danh sách chuyên khoa hiển thị lên trang chủ
    @GetMapping("/specialties")
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        List<Specialty> specialties = specialtyService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }

    // GET /api/public/doctors : Tìm kiếm danh sách bác sĩ theo tên hoặc lọc theo chuyên khoa
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDTO>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer specialtyId) {
        List<DoctorResponseDTO> doctors = doctorProfileService.searchDoctors(name, specialtyId);
        return ResponseEntity.ok(doctors);
    }

    // GET /api/public/schedules/available : Chọn chính xác các khung giờ khám còn trống của bác sĩ theo ngày
    @GetMapping("/schedules/available")
    public ResponseEntity<List<ScheduleResponseDTO>> getAvailableSchedules(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ScheduleResponseDTO> schedules = scheduleService.getAvailableSchedules(doctorId, date);
        return ResponseEntity.ok(schedules);
    }
}