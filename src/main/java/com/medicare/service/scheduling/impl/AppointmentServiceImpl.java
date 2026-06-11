package com.medicare.service.scheduling.impl;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.dto.response.DoctorStatisticsResponseDTO;
import com.medicare.entity.*;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.ScheduleStatus;
import com.medicare.exception.CustomException;
import com.medicare.mapper.AppointmentMapper;
import com.medicare.repository.*;
import com.medicare.service.notification.NotificationService;
import com.medicare.service.scheduling.AppointmentService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AppointmentMapper appointmentMapper;

    @Override
    @Transactional
    public AppointmentResponseDTO patientBookAppointment(AppointmentRequestDTO dto) {
        // ... (existing code)
        return null;
    }

    @Override
    @Transactional
    public AppointmentResponseDTO staffBookAppointment(UUID patientId, AppointmentRequestDTO dto) {
        // ... (existing code)
        return null;
    }

    private AppointmentResponseDTO processBooking(PatientProfile patient, User createdBy, AppointmentRequestDTO dto) {
        Schedule schedule = scheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new CustomException("Lịch khám không tồn tại hoặc đã bị xóa.", HttpStatus.NOT_FOUND));

        if (schedule.getStatus() == ScheduleStatus.FULL || schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new CustomException("Lịch khám này đã đầy hoặc đã bị hủy bỏ không thể đặt thêm.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(schedule.getDoctorProfile())
                .schedule(schedule)
                .createdBy(createdBy)
                .symptoms(dto.getSymptoms())
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        schedule.setCurrentPatients(schedule.getCurrentPatients() + 1);
        if (schedule.getCurrentPatients().equals(schedule.getMaxPatients())) {
            schedule.setStatus(ScheduleStatus.FULL);
        }
        scheduleRepository.save(schedule);

        // Gửi thông báo cho bệnh nhân
        String formattedDate = savedAppointment.getSchedule().getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String message = String.format("Lịch hẹn của bạn với BS. %s vào lúc %s ngày %s đã được tạo thành công.",
                savedAppointment.getDoctor().getUser().getFullName(),
                savedAppointment.getSchedule().getTimeSlot().getStartTime(),
                formattedDate);
        notificationService.createNotification(patient.getUser(), message, "/patient/appointments");

        return appointmentMapper.toResponseDTO(savedAppointment);
    }

    @Override
    @Transactional
    public void cancelAppointment(UUID appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn cần hủy.", HttpStatus.NOT_FOUND));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
            throw new CustomException("Cuộc hẹn đang diễn ra hoặc đã hoàn thành, không thể hủy bỏ.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        Schedule schedule = appointment.getSchedule();
        schedule.setCurrentPatients(Math.max(0, schedule.getCurrentPatients() - 1));
        if (schedule.getStatus() == ScheduleStatus.FULL) {
            schedule.setStatus(ScheduleStatus.AVAILABLE);
        }
        scheduleRepository.save(schedule);

        // Gửi thông báo hủy lịch
        String formattedDate = schedule.getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String message = String.format("Lịch hẹn của bạn vào lúc %s ngày %s đã bị hủy. Lý do: %s",
                schedule.getTimeSlot().getStartTime(), formattedDate, reason);
        notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/appointments");
    }

    @Override
    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        // Gửi thông báo khi check-in
        if (status == AppointmentStatus.ARRIVED) {
            String message = "Bạn đã check-in thành công. Vui lòng chờ đến lượt.";
            notificationService.createNotification(appointment.getPatient().getUser(), message, null);
        }
    }

    @Override
    public List<AppointmentResponseDTO> getPatientAppointmentHistory(UUID patientId) {
        return null;
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorAppointmentHistory(UUID doctorId) {
        return null;
    }

    @Override
    public List<AppointmentResponseDTO> searchAppointmentsForStaff(String cccd, LocalDate date) {
        return null;
    }

    @Override
    public DoctorStatisticsResponseDTO getDoctorStatistics(UUID doctorId) {
        return null;
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorUpcomingAppointments(UUID doctorId) {
        return null;
    }

    @Override
    @Transactional
    public void doctorUpdateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));

        // Bác sĩ chỉ có thể chuyển trạng thái sang IN_PROGRESS hoặc COMPLETED
        if (status != AppointmentStatus.IN_PROGRESS && status != AppointmentStatus.COMPLETED) {
            throw new CustomException("Bác sĩ chỉ có thể cập nhật trạng thái là 'Đang khám' hoặc 'Hoàn thành'.", HttpStatus.BAD_REQUEST);
        }

        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        // Gửi thông báo cho bệnh nhân khi khám xong
        if (status == AppointmentStatus.COMPLETED) {
            String message = String.format("Cuộc hẹn ngày %s của bạn với BS. %s đã hoàn tất. Vui lòng xem chi tiết bệnh án.",
                    appointment.getSchedule().getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    appointment.getDoctor().getUser().getFullName());
            notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/medical-records");
        }
    }
}
