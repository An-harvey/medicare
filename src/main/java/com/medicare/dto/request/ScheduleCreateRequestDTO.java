package com.medicare.dto.request;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequestDTO {
    private UUID doctorId;
    private LocalDate workDate;
    private Integer timeSlotId;
    private Integer maxPatients;
}