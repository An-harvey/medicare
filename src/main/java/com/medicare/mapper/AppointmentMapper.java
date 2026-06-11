package com.medicare.mapper;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ScheduleMapper.class})
public interface AppointmentMapper {

    @Mapping(source = "id", target = "appointmentId")
    @Mapping(source = "patient.user.fullName", target = "patientName")
    @Mapping(source = "doctor.user.fullName", target = "doctorName")
    @Mapping(source = "schedule.workDate", target = "workDate")
    @Mapping(source = "schedule.timeSlot.startTime", target = "startTime")
    AppointmentResponseDTO toResponseDTO(Appointment appointment);

    // Bỏ qua ID tự sinh và gán cứng trạng thái PENDING khi mới tạo
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "patient", ignore = true) // Sẽ được set thủ công ở Service qua Token
    @Mapping(target = "doctor", ignore = true) // Sẽ được truy vấn và set ở Service
    @Mapping(target = "schedule", ignore = true) // Sẽ được truy vấn và set ở Service
    @Mapping(target = "createdBy", ignore = true) // Sẽ được set thủ công ở Service qua Token
    @Mapping(target = "cancelReason", ignore = true)
    @Mapping(target = "symptoms", source = "symptoms")
    Appointment toEntity(AppointmentRequestDTO dto);
}
