package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RevenueChartResponseDTO {
    private List<MonthlyRevenue> data;
    private String highestMonth;
    private String lowestMonth;
    private BigDecimal averagePerMonth;
    private BigDecimal totalRevenue;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
    }
}
