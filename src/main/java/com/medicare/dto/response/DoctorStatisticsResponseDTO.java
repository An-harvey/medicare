package com.medicare.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorStatisticsResponseDTO {
    private long totalExaminedThisWeek;  // Tổng số ca đã khám tuần này
    private long totalExaminedThisMonth; // Tổng số ca đã khám tháng này
    private long totalPendingAppointments; // Số ca đang chờ khám
}