package com.medicare.controller.staff;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.dto.response.ScheduleResponseDTO;
import com.medicare.enums.AppointmentStatus;
import com.medicare.service.scheduling.AppointmentService;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('STAFF')") // Bắt buộc Token phải có quyền STAFF
@RequiredArgsConstructor
public class StaffController {

    private final AppointmentService appointmentService;
    private final ScheduleService scheduleService;

    //  Tìm kiếm và lọc lịch hẹn đa điều kiện
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> searchAppointments(
            @RequestParam(required = false) String cccd,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentResponseDTO> response = appointmentService.searchAppointmentsForStaff(cccd, date);
        return ResponseEntity.ok(response);
    }

    //  Nhân viên tạo lịch hẹn trực tiếp cho bệnh nhân tại quầy
    @PostMapping("/appointments/patient/{patientId}")
    public ResponseEntity<AppointmentResponseDTO> bookAppointmentForPatient(
            @PathVariable UUID patientId,
            @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO response = appointmentService.staffBookAppointment(patientId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //  Cập nhật trạng thái lịch hẹn (VD: Check-in khi bệnh nhân đến -> ARRIVED)
    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<String> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok("Cập nhật trạng thái cuộc hẹn thành công.");
    }

    //  Xem lịch làm việc tổng quan của các bác sĩ
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
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ScheduleResponseDTO> result = scheduleService.getAllSchedules(doctorId, workDate, specialtyId, pageable);
        return ResponseEntity.ok(result);
    }
}
