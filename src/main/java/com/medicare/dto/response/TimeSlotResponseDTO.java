package com.medicare.dto.response;

import com.medicare.entity.TimeSlot;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class TimeSlotResponseDTO {
    private Integer id;
    private LocalTime startTime;
    private Boolean status;
}