package com.medicare.service.dashboard;

import com.medicare.dto.response.dashboard.*;

import java.util.List;

public interface DashboardAdminService {
    List<AlertResponseDTO> getAlerts();
    KpiSummaryResponseDTO getKpiSummary();
    RevenueChartResponseDTO getRevenueChartData(int year);
    List<TopDoctorResponseDTO> getTopDoctors(int month, int year);
    List<SpecialtyStatsResponseDTO> getSpecialtyStats(int month);
    List<ActivityLogResponseDTO> getTodayActivities();
}
