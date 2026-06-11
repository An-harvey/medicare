package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KpiSummaryResponseDTO {
    private KpiItem todayAppointments;
    private KpiItem totalUsers;
    private KpiItem activeDoctors;
    private KpiItem monthlyRevenue;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KpiItem {
        private String value; // Could be a number or formatted string (e.g., "$10,000")
        private Double percentageChange; // Positive for increase, negative for decrease
        private boolean isIncrease;
    }
}
