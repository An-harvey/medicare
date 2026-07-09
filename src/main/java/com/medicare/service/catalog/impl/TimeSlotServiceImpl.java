package com.medicare.service.catalog.impl;

import com.medicare.dto.request.TimeSlotRequestDTO;
import com.medicare.dto.response.TimeSlotResponseDTO;
import com.medicare.entity.TimeSlot;
import com.medicare.exception.CustomException;
import com.medicare.mapper.CatalogMapper;
import com.medicare.mapper.ScheduleMapper;
import com.medicare.repository.ScheduleRepository;
import com.medicare.repository.TimeSlotRepository;
import com.medicare.service.catalog.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlot> getActiveTimeSlots() {
        return timeSlotRepository.findByStatusTrue();
    }

    @Override
    @Transactional
    public TimeSlotResponseDTO createTimeSlot(TimeSlotRequestDTO request) {

        if(timeSlotRepository.existsByStartTime(request.getStartTime())){
            throw new CustomException("Khung giờ khám đã tồn tại", HttpStatus.BAD_REQUEST);
        }
        TimeSlot timeSlot = TimeSlot.builder()
                .startTime(request.getStartTime())
                .status(request.getStatus())
                .build();
        TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);

        return TimeSlotResponseDTO.builder()
                .id(savedTimeSlot.getId())
                .startTime(savedTimeSlot.getStartTime())
                .status(savedTimeSlot.getStatus())
                .build();
    }

    @Override
    public List<TimeSlotResponseDTO> getAllTimeSlotsForAdmin() {
        return  timeSlotRepository.findAllByOrderByStartTimeAsc()
                .stream()
                .map(scheduleMapper::toTimeSlotResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTimeSlot(Integer id){
        if (scheduleRepository.existsByTimeSlot_Id(id)) {
            throw new CustomException("Không thể xóa:" +
                    " Khung giờ này đang được sử dụng trong lịch làm việc.", HttpStatus.BAD_REQUEST);
        }
        timeSlotRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TimeSlotResponseDTO updateTimeSlot(Integer id, TimeSlotRequestDTO request){
        TimeSlot timeSlot= timeSlotRepository.findById(id)
                .orElseThrow(() -> new CustomException("Khônng tìm thấy khung giờ phù hợp", HttpStatus.NOT_FOUND));

        // Kiểm tra khi Admin thực sự muốn thay đổi thời gian bắt đầu (startTime)
        if (request.getStartTime() != null && !timeSlot.getStartTime().equals(request.getStartTime())) {

            // Kiểm tra xem ID khung giờ này đã được sử dụng trong bảng Schedules (Lịch làm việc) chưa
            boolean isTimeSlotUsed = scheduleRepository.existsByTimeSlot_Id(id);
            if (isTimeSlotUsed) {
                throw new CustomException(
                        "Khung giờ này đã được sử dụng để xếp lịch làm việc (trong quá khứ hoặc tương lai)." +
                                " Không thể thay đổi thời gian bắt đầu nhằm bảo toàn lịch sử bệnh án! " +
                                "Bạn vui lòng cập nhật trạng thái hoạt động thành ẩn (status = false) " +
                                "và tạo một khung giờ mới.",
                        HttpStatus.BAD_REQUEST
                );
            }

            // Nếu chưa được sử dụng ở đâu, tiến hành kiểm tra trùng giờ với các bản ghi KHÁC trước khi cho sửa
            boolean isDuplicate = timeSlotRepository.existsByStartTimeAndIdNot(request.getStartTime(), id);
            if (isDuplicate) {
                throw new CustomException("Khung giờ bắt đầu này đã tồn tại trên hệ thống" +
                        ", vui lòng chọn giờ khác.", HttpStatus.BAD_REQUEST);
            }

            // Hợp lệ thì mới gán giá trị mới
            timeSlot.setStartTime(request.getStartTime());
        }

        // Cho phép thay đổi trạng thái đóng/mở (status: true/false) của khung giờ thoải mái
        if (request.getStatus() != null) {
            timeSlot.setStatus(request.getStatus());
        }

        TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);

        return scheduleMapper.toTimeSlotResponseDTO(savedTimeSlot);

    }
}