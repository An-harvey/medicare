package com.medicare.controller.admin;

import com.medicare.dto.response.dashboard.*;
import com.medicare.service.dashboard.DashboardAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardAdminService dashboardAdminService;

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponseDTO>> getAlerts() {
        return ResponseEntity.ok(dashboardAdminService.getAlerts());
    }

    @GetMapping("/kpi-summary")
    public ResponseEntity<KpiSummaryResponseDTO> getKpiSummary() {
        return ResponseEntity.ok(dashboardAdminService.getKpiSummary());
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueChartResponseDTO> getRevenueChart(
            @RequestParam(defaultValue = "0") int year) {
        int currentYear = (year == 0) ? LocalDate.now().getYear() : year;
        return ResponseEntity.ok(dashboardAdminService.getRevenueChartData(currentYear));
    }

    @GetMapping("/top-doctors")
    public ResponseEntity<List<TopDoctorResponseDTO>> getTopDoctors(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        LocalDate now = LocalDate.now();
        int currentMonth = (month == 0) ? now.getMonthValue() : month;
        int currentYear = (year == 0) ? now.getYear() : year;
        return ResponseEntity.ok(dashboardAdminService.getTopDoctors(currentMonth, currentYear));
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<SpecialtyStatsResponseDTO>> getSpecialtyStats(
            @RequestParam(defaultValue = "0") int month) {
        int currentMonth = (month == 0) ? LocalDate.now().getMonthValue() : month;
        return ResponseEntity.ok(dashboardAdminService.getSpecialtyStats(currentMonth));
    }

    @GetMapping("/activities/today")
    public ResponseEntity<List<ActivityLogResponseDTO>> getTodayActivities() {
        return ResponseEntity.ok(dashboardAdminService.getTodayActivities());
    }
}
