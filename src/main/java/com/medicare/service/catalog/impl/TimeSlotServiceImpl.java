package com.medicare.service.catalog.impl;

import com.medicare.dto.request.TimeSlotRequestDTO;
import com.medicare.dto.response.TimeSlotResponseDTO;
import com.medicare.entity.TimeSlot;
import com.medicare.exception.CustomException;
import com.medicare.mapper.CatalogMapper;
import com.medicare.mapper.ScheduleMapper;
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
            throw new RuntimeException("Khung giờ khám đã tồn tại");
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
        timeSlotRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TimeSlotResponseDTO updateTimeSlot(Integer id, TimeSlotRequestDTO request){
        TimeSlot timeSlot= timeSlotRepository.findById(id)
                .orElseThrow(() -> new CustomException("Khônng tìm thấy khung giờ phù hợp", HttpStatus.NOT_FOUND));
        if(request.getStatus() !=null){
            timeSlot.setStatus(request.getStatus());
        }
        if(request.getStartTime() !=null){
            timeSlot.setStartTime(request.getStartTime());
        }

        TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);

        return scheduleMapper.toTimeSlotResponseDTO(savedTimeSlot);

    }
}