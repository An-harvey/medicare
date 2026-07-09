package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLogResponseDTO {
    private LocalTime time;
    private String activityType; // e.g., "Đăng ký mới", "Tạo lịch hẹn", "Hoàn tất ca khám", "Hủy lịch"
    private String description;
}
