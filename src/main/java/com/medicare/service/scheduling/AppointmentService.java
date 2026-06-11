package com.medicare.service.scheduling;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.dto.response.DoctorStatisticsResponseDTO;
import com.medicare.enums.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    // Bệnh nhân tự đặt lịch hẹn qua mạng
    AppointmentResponseDTO patientBookAppointment(AppointmentRequestDTO dto);

    // Nhân viên đặt lịch trực tiếp tại quầy tiếp đón
    AppointmentResponseDTO staffBookAppointment(UUID patientId, AppointmentRequestDTO dto);

    // Hủy lịch hẹn kèm theo lý do
    void cancelAppointment(UUID appointmentId, String reason);

    // Cập nhật trạng thái cuộc hẹn (Đã đến, Đang khám, Đã hoàn thành...)
    void updateAppointmentStatus(UUID appointmentId, AppointmentStatus status);

    // Xem lịch sử đặt hẹn của bệnh nhân hiện tại
    List<AppointmentResponseDTO> getPatientAppointmentHistory(UUID patientId);

    // Dánh cho Bác sĩ Lấy toàn bộ danh sách lịch sử khám bệnh của một bác sĩ cụ thể.
    List<AppointmentResponseDTO> getDoctorAppointmentHistory(UUID doctorId);

    //Giúp nhân viên tra cứu nhanh lịch hẹn của một bệnh nhân qua cccd
    List<AppointmentResponseDTO> searchAppointmentsForStaff(String cccd, LocalDate date);

    //Admin/bác sĩ xem số liệu thống kê tổng quan của một bác sĩ.
    DoctorStatisticsResponseDTO getDoctorStatistics(UUID doctorId);

    // Bác sĩ xem các cuộc hẹn sắp tới
    List<AppointmentResponseDTO> getDoctorUpcomingAppointments(UUID doctorId);

    // Bác sĩ cập nhật trạng thái cuộc hẹn
    void doctorUpdateAppointmentStatus(UUID appointmentId, AppointmentStatus status);
}
