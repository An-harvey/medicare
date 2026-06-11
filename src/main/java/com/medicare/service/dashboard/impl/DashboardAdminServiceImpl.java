package com.medicare.service.dashboard.impl;

import com.medicare.dto.response.dashboard.*;
import com.medicare.enums.AppointmentStatus;
import com.medicare.repository.*;
import com.medicare.service.dashboard.DashboardAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardAdminServiceImpl implements DashboardAdminService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final ScheduleRepository scheduleRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public List<AlertResponseDTO> getAlerts() {
        List<AlertResponseDTO> alerts = new ArrayList<>();

        //  Đếm số lịch hẹn chưa phân công (PENDING)
        long pendingAppointments = appointmentRepository.countByStatus(AppointmentStatus.PENDING);
        if (pendingAppointments > 0) {
            alerts.add(new AlertResponseDTO(
                    "warning",
                    "Có " + pendingAppointments + " lịch hẹn đang chờ xử lý.",
                    "/admin/appointments?status=PENDING"
            ));
        }

        //  So sánh doanh thu tháng này và tháng trước
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime startOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
        LocalDateTime endOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);

        BigDecimal revenueThisMonth = paymentRepository.sumRevenueBetween(startOfThisMonth, now);
        BigDecimal revenueLastMonth = paymentRepository.sumRevenueBetween(startOfLastMonth, endOfLastMonth);

        if (revenueLastMonth.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal difference = revenueThisMonth.subtract(revenueLastMonth);
            if (difference.compareTo(BigDecimal.ZERO) > 0) {
                alerts.add(new AlertResponseDTO(
                        "success",
                        "Doanh thu tháng này tăng so với tháng trước.",
                        "/admin/payments"
                ));
            } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
                alerts.add(new AlertResponseDTO(
                        "info",
                        "Doanh thu tháng này giảm so với tháng trước.",
                        "/admin/payments"
                ));
            }
        }

        return alerts;
    }

    @Override
    public KpiSummaryResponseDTO getKpiSummary() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();

        //  Appointments Today
        long appointmentsToday = appointmentRepository.countBySchedule_WorkDate(today);
        long appointmentsYesterday = appointmentRepository.countBySchedule_WorkDate(yesterday);
        double appointmentChange = calculatePercentageChange(appointmentsToday, appointmentsYesterday);

        //  Total Users
        long totalUsers = userRepository.count();
        long usersUntilYesterday = userRepository.countByCreatedAtBefore(startOfDay);
        double userChange = calculatePercentageChange(totalUsers, usersUntilYesterday);

        //  Active Doctors Today
        long activeDoctors = doctorProfileRepository.countActiveDoctorsByDate(today);
        long totalDoctors = doctorProfileRepository.count();
        double activeDoctorPercentage = (totalDoctors > 0) ? ((double) activeDoctors / totalDoctors) * 100 : 0.0;

        //  Monthly Revenue
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        BigDecimal revenueThisMonth = paymentRepository.sumRevenueBetween(startOfMonth, LocalDateTime.now());
        BigDecimal revenueLastMonth = paymentRepository.sumRevenueBetween(startOfLastMonth, startOfMonth);

        double revenueChange = 0.0;
        if (revenueLastMonth.compareTo(BigDecimal.ZERO) > 0) {
            revenueChange = revenueThisMonth.subtract(revenueLastMonth)
                    .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return KpiSummaryResponseDTO.builder()
                .todayAppointments(new KpiSummaryResponseDTO.KpiItem(String.valueOf(appointmentsToday), appointmentChange, appointmentChange >= 0))
                .totalUsers(new KpiSummaryResponseDTO.KpiItem(String.valueOf(totalUsers), userChange, userChange >= 0))
                .activeDoctors(new KpiSummaryResponseDTO.KpiItem(String.valueOf(activeDoctors), activeDoctorPercentage, true))
                .monthlyRevenue(new KpiSummaryResponseDTO.KpiItem(revenueThisMonth.toString(), revenueChange, revenueChange >= 0))
                .build();
    }

    private double calculatePercentageChange(long current, long previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((double) (current - previous) / previous) * 100;
    }

    @Override
    public RevenueChartResponseDTO getRevenueChartData(int year) {
        List<Object[]> rawData = paymentRepository.findMonthlyRevenueByYear(year);
        List<RevenueChartResponseDTO.MonthlyRevenue> data = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal highest = BigDecimal.ZERO;
        BigDecimal lowest = null;
        String highestMonth = "";
        String lowestMonth = "";

        for (int i = 1; i <= 12; i++) {
            BigDecimal revenue = BigDecimal.ZERO;
            for (Object[] row : rawData) {
                if (((Number) row[0]).intValue() == i) {
                    revenue = new BigDecimal(row[1].toString());
                    break;
                }
            }
            data.add(new RevenueChartResponseDTO.MonthlyRevenue("Tháng " + i, revenue));
            total = total.add(revenue);

            if (revenue.compareTo(highest) > 0) {
                highest = revenue;
                highestMonth = "Tháng " + i;
            }
            if (lowest == null || revenue.compareTo(lowest) < 0) {
                lowest = revenue;
                lowestMonth = "Tháng " + i;
            }
        }

        BigDecimal average = total.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        return RevenueChartResponseDTO.builder()
                .data(data)
                .highestMonth(highestMonth)
                .lowestMonth(lowestMonth)
                .averagePerMonth(average)
                .totalRevenue(total)
                .build();
    }

    @Override
    public List<TopDoctorResponseDTO> getTopDoctors(int month, int year) {
        List<Object[]> rawData = appointmentRepository.findTopDoctorsByMonth(month, year);
        return rawData.stream()
                .map(row -> TopDoctorResponseDTO.builder()
                        .doctorId(UUID.fromString(row[0].toString()))
                        .name((String) row[1])
                        .academicTitle((String) row[2])
                        .specialty((String) row[3])
                        .rating(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                        .totalAppointments(((Number) row[5]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SpecialtyStatsResponseDTO> getSpecialtyStats(int month) {
        List<Object[]> rawData = appointmentRepository.countAppointmentsBySpecialty(month);
        long totalAppointments = rawData.stream().mapToLong(row -> ((Number) row[2]).longValue()).sum();

        return rawData.stream()
                .map(row -> {
                    long count = ((Number) row[2]).longValue();
                    double percentage = (totalAppointments > 0) ? ((double) count / totalAppointments) * 100 : 0.0;
                    return new SpecialtyStatsResponseDTO(
                            ((Number) row[0]).intValue(),
                            (String) row[1],
                            count,
                            percentage
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ActivityLogResponseDTO> getTodayActivities() {
        // Mock data as Activities table does not exist
        return List.of(
            new ActivityLogResponseDTO(LocalTime.of(8, 30), "Đăng ký mới", "Bệnh nhân Nguyễn Văn A vừa đăng ký tài khoản."),
            new ActivityLogResponseDTO(LocalTime.of(9, 15), "Tạo lịch hẹn", "Bệnh nhân Trần Thị B đặt lịch khám Tim mạch."),
            new ActivityLogResponseDTO(LocalTime.of(10, 0), "Hoàn tất ca khám", "Bác sĩ Lê Văn C đã hoàn thành ca khám.")
        );
    }
}
