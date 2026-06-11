package com.medicare.dto.response;

import com.medicare.enums.AppointmentStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponseDTO {
    private UUID appointmentId;
    private String patientName;
    private String doctorName;
    private LocalDate workDate;
    private LocalTime startTime;
    private String symptoms;
    private AppointmentStatus status;
    private String cancelReason;
}
