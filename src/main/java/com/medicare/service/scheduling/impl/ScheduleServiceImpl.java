package com.medicare.service.scheduling.impl;

import com.medicare.dto.request.ScheduleCreateRequestDTO;
import com.medicare.dto.request.ScheduleUpdateRequestDTO;
import com.medicare.dto.response.ScheduleResponseDTO;
import com.medicare.entity.DoctorProfile;
import com.medicare.entity.Schedule;
import com.medicare.entity.TimeSlot;
import com.medicare.enums.ScheduleStatus;
import com.medicare.exception.CustomException;
import com.medicare.mapper.ScheduleMapper;
import com.medicare.repository.DoctorProfileRepository;
import com.medicare.repository.ScheduleRepository;
import com.medicare.repository.TimeSlotRepository;
import com.medicare.service.scheduling.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    @Transactional
    public ScheduleResponseDTO createSchedule(ScheduleCreateRequestDTO dto) {
        DoctorProfile doctor = doctorProfileRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin bác sĩ.", HttpStatus.NOT_FOUND));

        TimeSlot timeSlot = timeSlotRepository.findById(dto.getTimeSlotId())
                .orElseThrow(() -> new CustomException("Khung giờ khám không tồn tại.", HttpStatus.NOT_FOUND));

        Schedule schedule = Schedule.builder()
                .doctorProfile(doctor)
                .workDate(dto.getWorkDate())
                .timeSlot(timeSlot)
                .maxPatients(dto.getMaxPatients())
                .currentPatients(0)
                .status(ScheduleStatus.AVAILABLE)
                .build();

        Schedule saved = scheduleRepository.save(schedule);
        return mapToScheduleResponse(saved);
    }
    @Override
    public Page<ScheduleResponseDTO> getAllSchedules(UUID doctorId, LocalDate workDate, Integer specialtyId, Pageable pageable) {
        // Repository truy vấn ra Entity (Schedule) dựa trên các bộ lọc
        Page<Schedule> schedulePage = scheduleRepository.findAllSchedulesWithFilter(doctorId, workDate, specialtyId, pageable);

        // Mapper tự động ánh xạ Entity sang DTO mới (với scheduleId và Enum)
        return schedulePage.map(scheduleMapper::toScheduleResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponseDTO> getAvailableSchedules(UUID doctorId, LocalDate date) {
        List<Schedule> availableList = scheduleRepository.findByDoctorProfile_DoctorIdAndWorkDateAndStatus(
                doctorId, date, ScheduleStatus.AVAILABLE);

        return availableList.stream().map(this::mapToScheduleResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponseDTO> getDoctorSchedulesByDate(UUID doctorId, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByDoctorProfile_DoctorIdAndWorkDate(doctorId, date);
        return schedules.stream().map(this::mapToScheduleResponse).collect(Collectors.toList());
    }

    // Helper method map Entity -> DTO thủ công (hoặc tích hợp MapStruct tùy chọn)
    private ScheduleResponseDTO mapToScheduleResponse(Schedule entity) {
        return ScheduleResponseDTO.builder()
                .scheduleId(entity.getId())
                .doctorId(entity.getDoctorProfile().getDoctorId())
                .doctorName(entity.getDoctorProfile().getUser().getFullName())
                .workDate(entity.getWorkDate())
                .startTime(entity.getTimeSlot().getStartTime())
                .maxPatients(entity.getMaxPatients())
                .currentPatients(entity.getCurrentPatients())
                .status(entity.getStatus())
                .build();
    }

    //Delete lịch làm việc
    @Override
    @Transactional
    public void deleteSchedule(UUID scheduleId) {
        //  Kiểm tra xem lịch làm việc có tồn tại không
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new com.medicare.exception.CustomException("Lịch làm việc không tồn tại hoặc đã bị xóa trước đó.", HttpStatus.NOT_FOUND));

        //  Kiểm tra ràng buộc bảo vệ dữ liệu hệ thống
        if (schedule.getCurrentPatients() != null && schedule.getCurrentPatients() > 0) {
            throw new com.medicare.exception.CustomException(
                    "Không thể xóa lịch làm việc này vì đã có " + schedule.getCurrentPatients() + " bệnh nhân đặt chỗ thành công. Vui lòng thực hiện hủy ca khám (Cancel) thay vì xóa hoàn toàn.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Tiến hành xóa khỏi database nếu thỏa mãn điều kiện
        scheduleRepository.delete(schedule);
    }

    @Override
    @Transactional
    public ScheduleResponseDTO updateSchedule(UUID scheduleId, ScheduleUpdateRequestDTO dto) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new CustomException("Lịch làm việc không tồn tại.", HttpStatus.NOT_FOUND));

        if (dto.getMaxPatients() != null) {
            if (dto.getMaxPatients() < schedule.getCurrentPatients()) {
                throw new CustomException("Số lượng bệnh nhân tối đa không thể nhỏ hơn số lượng đã đăng ký.", HttpStatus.BAD_REQUEST);
            }
            schedule.setMaxPatients(dto.getMaxPatients());
        }

        Schedule updatedSchedule = scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponseDTO(updatedSchedule);
    }
}
