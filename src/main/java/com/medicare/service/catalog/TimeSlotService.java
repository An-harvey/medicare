package com.medicare.service.catalog;

import com.medicare.dto.request.TimeSlotRequestDTO;
import com.medicare.dto.response.TimeSlotResponseDTO;
import com.medicare.entity.TimeSlot;
import java.util.List;

public interface TimeSlotService {
    List<TimeSlot> getActiveTimeSlots();
    TimeSlotResponseDTO createTimeSlot(TimeSlotRequestDTO request);
    List<TimeSlotResponseDTO> getAllTimeSlotsForAdmin();
    void deleteTimeSlot(Integer id);
    TimeSlotResponseDTO updateTimeSlot(Integer id, TimeSlotRequestDTO request);
}
