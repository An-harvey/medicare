package com.medicare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class AppointmentRequestDTO {
    @NotNull(message = "Mã bác sĩ (doctorId) không được để thiếu")
    private UUID doctorId;

    @NotNull(message = "Mã lịch khám (scheduleId) không được để thiếu")
    private UUID scheduleId;

    @NotBlank(message = "Mô tả triệu chứng không được để trống")
    @Size(max = 1000, message = "Mô tả triệu chứng quá dài (tối đa 1000 ký tự)")
    private String symptoms;

}