package com.medicare.dto.response;

import com.medicare.enums.ScheduleStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponseDTO {
    private UUID scheduleId;
    private UUID doctorId;
    private String doctorName;
    private LocalDate workDate;
    private LocalTime startTime;
    private Integer maxPatients;
    private Integer currentPatients;
    private ScheduleStatus status;
}