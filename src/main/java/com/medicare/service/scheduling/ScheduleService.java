package com.medicare.service.scheduling;

import com.medicare.dto.request.ScheduleCreateRequestDTO;
import com.medicare.dto.request.ScheduleUpdateRequestDTO;
import com.medicare.dto.response.ScheduleResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ScheduleService {
    // Admin tạo lịch làm việc cho bác sĩ
    ScheduleResponseDTO createSchedule(ScheduleCreateRequestDTO dto);

    // Admin/Staff xem lịch làm việc
    Page<ScheduleResponseDTO> getAllSchedules(UUID doctorId, LocalDate workDate, Integer specialtyId, Pageable pageable);

    // Bệnh nhân tìm kiếm khung giờ trống của 1 bác sĩ trong ngày cụ thể
    List<ScheduleResponseDTO> getAvailableSchedules(UUID doctorId, LocalDate date);

    // Bác sĩ xem lịch làm việc cá nhân của mình theo ngày
    List<ScheduleResponseDTO> getDoctorSchedulesByDate(UUID doctorId, LocalDate date);

    //Xóa lịch làm việc
    void deleteSchedule(UUID scheduleId);

    //Cập nhật lịch làm việc
    ScheduleResponseDTO updateSchedule(UUID scheduleId, ScheduleUpdateRequestDTO dto);

}
