package com.medicare.service.scheduling.impl;

import com.medicare.entity.Appointment;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.PaymentStatus;
import com.medicare.enums.ScheduleStatus;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.ScheduleRepository;
import com.medicare.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentSchedulerService {

    private final AppointmentRepository appointmentRepository;
    private final ScheduleRepository scheduleRepository; // Không cần PaymentRepository nữa
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0/15 * * * *")
    @Transactional
    public void sendPaymentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thresholdStart = now.plusMinutes(105);
        LocalDateTime thresholdEnd = now.plusMinutes(120);

        List<Appointment> upcomingUnpaid = fetchUnpaidAppointments(thresholdStart, thresholdEnd);

        for (Appointment a : upcomingUnpaid) {
            // BỌC TRY-CATCH TOÀN BỘ LOGIC CỦA 1 CA KHÁM
            try {
                String msg = String.format("Nhắc nhở: Bạn có lịch khám lúc %s. Vui lòng thanh toán online hoặc có mặt tại quầy ngay bây giờ để làm thủ tục.",
                        a.getSchedule().getTimeSlot().getStartTime());

                // Gọi ra ngoài (gửi Email/App Notification) -> Rất dễ timeout/lỗi
                notificationService.createNotification(a.getPatient().getUser(), msg, "/patient/appointments");

                log.info("Đã gửi nhắc nhở thanh toán cho cuộc hẹn ID: {}", a.getId());
            } catch (Exception e) {
                // Nếu lỗi, chỉ ghi Log và bỏ qua, vòng lặp vẫn tiếp tục chạy cho người khác
                log.error("LỖI CỤC BỘ: Không thể gửi thông báo nhắc nhở cho cuộc hẹn {}. Nguyên nhân: {}", a.getId(), e.getMessage());
            }
        }
    }
    //  Tự động hủy trước 10 phút nếu chưa thanh toán (Chạy mỗi phút)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoCancelUnpaidAppointments() {
        // Mốc thời gian giới hạn là 10 phút tới
        LocalDateTime threshold = LocalDateTime.now().plusMinutes(10);

        List<AppointmentStatus> targetStatuses = Arrays.asList(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

        // Gọi hàm truy vấn mới tạo để lấy toàn bộ ca khám quá hạn (bao gồm cả các ca ở quá khứ nếu bị lọt)
        List<Appointment> overdueUnpaid = appointmentRepository.findOverdueUnpaidAppointments(
                PaymentStatus.UNPAID,
                targetStatuses,
                threshold.toLocalDate(),
                threshold.toLocalTime()
        );

        for (Appointment a : overdueUnpaid) {
            // Hủy lịch
            try {
                //  Cập nhật Database (Hủy lịch)
                a.setStatus(AppointmentStatus.CANCELLED);
                a.setCancelReason("Hệ thống tự động hủy do bệnh nhân không thanh toán/không Check-in đúng giờ quy định (trước 10 phút).");
                appointmentRepository.save(a);

                //  Giải phóng Slot
                scheduleRepository.cancelSlotSafely(
                        a.getSchedule().getId(),
                        ScheduleStatus.FULL,
                        ScheduleStatus.AVAILABLE
                );

                //  Gửi thông báo (Tách Try-Catch lồng)
                try {
                    String msg = "Lịch khám của bạn đã bị hủy tự động do không hoàn thành thủ tục thanh toán/Check-in đúng giờ.";
                    notificationService.createNotification(a.getPatient().getUser(), msg, "/patient/appointments");
                } catch (Exception notifEx) {
                    // Nếu lỗi thông báo, DB vẫn được cập nhật thành công (Lịch vẫn được hủy)
                    log.error("KHÔNG THỂ GỬI THÔNG BÁO HỦY LỊCH cho cuộc hẹn {}: {}", a.getId(), notifEx.getMessage());
                }

                log.info("Đã tự động hủy cuộc hẹn: {} do UNPAID.", a.getId());

            } catch (Exception dbEx) {
                // Nếu lỗi DB của ca này, log lại, tránh nổ @Transactional toàn cục
                log.error("LỖI NGHIÊM TRỌNG: Quá trình hủy cuộc hẹn {} thất bại: {}", a.getId(), dbEx.getMessage());
            }
        }
    }

    /**
     * HÀM HELPER: Lấy danh sách chưa thanh toán, xử lý an toàn cả khi khung giờ quét vắt qua 12h đêm
     */
    private List<Appointment> fetchUnpaidAppointments(LocalDateTime start, LocalDateTime end) {
        List<AppointmentStatus> targetStatuses = Arrays.asList(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

        // Trường hợp bình thường (cùng 1 ngày)
        if (start.toLocalDate().isEqual(end.toLocalDate())) {
            return appointmentRepository.findUnpaidAppointmentsByTimeRange(
                    PaymentStatus.UNPAID, targetStatuses,
                    start.toLocalDate(), start.toLocalTime(), end.toLocalTime()
            );
        } else {
            // Trường hợp Vắt qua nửa đêm (Ví dụ: Start lúc 23:55 -> End lúc 00:05 sáng hôm sau)
            List<Appointment> day1 = appointmentRepository.findUnpaidAppointmentsByTimeRange(
                    PaymentStatus.UNPAID, targetStatuses,
                    start.toLocalDate(), start.toLocalTime(), LocalTime.MAX // Đến 23:59:59
            );
            List<Appointment> day2 = appointmentRepository.findUnpaidAppointmentsByTimeRange(
                    PaymentStatus.UNPAID, targetStatuses,
                    end.toLocalDate(), LocalTime.MIN, end.toLocalTime()     // Từ 00:00:00
            );
            day1.addAll(day2);
            return day1;
        }
    }
}