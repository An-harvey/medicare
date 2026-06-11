package com.medicare.mapper;

import com.medicare.dto.response.ScheduleResponseDTO;
import com.medicare.dto.response.TimeSlotResponseDTO;
import com.medicare.entity.Schedule;
import com.medicare.entity.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {
    @Mapping(source = "status", target = "status")
    TimeSlotResponseDTO toTimeSlotResponseDTO(TimeSlot timeSlot);
    // Ánh xạ id của Schedule thành scheduleId
    @Mapping(source = "id", target = "scheduleId")

    // Ánh xạ thông tin bác sĩ từ quan hệ doctorProfile
    @Mapping(source = "doctorProfile.doctorId", target = "doctorId")
    // Trỏ xuyên qua doctorProfile để vào User lấy fullName
    @Mapping(source = "doctorProfile.user.fullName", target = "doctorName")

    // Ánh xạ startTime từ quan hệ timeSlot
    @Mapping(source = "timeSlot.startTime", target = "startTime")

    // Các trường workDate, maxPatients, currentPatients, status
    // sẽ được MapStruct tự động ánh xạ vì trùng tên giữa Entity và DTO
    ScheduleResponseDTO toScheduleResponseDTO(Schedule schedule);
}