package com.medicare.dto.request;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class AppointmentRequestDTO {
    private UUID doctorId;
    private UUID scheduleId;
    private String symptoms;
    // patientId và createdById sẽ được Backend tự động lấy từ Token, không để Frontend gửi lên
}