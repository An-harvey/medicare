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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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
    private final NotificationService notificationService;
    private final AppointmentMapper appointmentMapper;


    //Bệnh nhân đặt lịch khám trên web
    @Override
    @Transactional
    public AppointmentResponseDTO patientBookAppointment(AppointmentRequestDTO dto) {
        User currentUser = SecurityUtils.getCurrentUser();
        PatientProfile patientProfile = patientProfileRepository.findById(currentUser.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bệnh nhân.", HttpStatus.NOT_FOUND));

        // Bệnh nhân tự đặt -> Trạng thái PENDING
        return processBooking(patientProfile, currentUser, dto, AppointmentStatus.PENDING);
    }

    //Bệnh nhân gọi điện/đến trực tiếp gặp staff đặt lịch
    @Override
    @Transactional
    public AppointmentResponseDTO staffBookAppointment(UUID patientId, AppointmentRequestDTO dto) {
        User staffUser = SecurityUtils.getCurrentUser();
        PatientProfile patientProfile = patientProfileRepository.findById(patientId)
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bệnh nhân với ID: " + patientId, HttpStatus.NOT_FOUND));

        // Staff đặt hộ -> Trạng thái mặc định là CONFIRMED
        return processBooking(patientProfile, staffUser, dto, AppointmentStatus.CONFIRMED);
    }


    //Xử lý đặt lịch (từ patient và staff)
    private AppointmentResponseDTO processBooking(PatientProfile patient, User createdBy, AppointmentRequestDTO dto, AppointmentStatus initialStatus) {
        Schedule schedule = scheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new CustomException("Lịch khám không tồn tại hoặc đã bị xóa.", HttpStatus.NOT_FOUND));

        if (schedule.getStatus() == ScheduleStatus.FULL || schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new CustomException("Lịch khám này đã đầy hoặc đã bị hủy bỏ, không thể đặt thêm.", HttpStatus.BAD_REQUEST);
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(schedule.getDoctorProfile())
                .schedule(schedule)
                .createdBy(createdBy)
                .symptoms(dto.getSymptoms())
                .status(initialStatus)
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        schedule.setCurrentPatients(schedule.getCurrentPatients() + 1);
        if (schedule.getCurrentPatients().equals(schedule.getMaxPatients())) {
            schedule.setStatus(ScheduleStatus.FULL);
        }
        scheduleRepository.save(schedule);

        // Thông báo
        String formattedDate = savedAppointment.getSchedule().getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String statusText = (initialStatus == AppointmentStatus.CONFIRMED) ? "đã được xác nhận" : "đang chờ xác nhận";
        String message = String.format("Lịch hẹn của bạn với BS. %s vào lúc %s ngày %s đã được tạo và %s.",
                savedAppointment.getDoctor().getUser().getFullName(),
                savedAppointment.getSchedule().getTimeSlot().getStartTime(),
                formattedDate, statusText);

        notificationService.createNotification(patient.getUser(), message, "/patient/appointments");

        return appointmentMapper.toResponseDTO(savedAppointment);
    }

    @Override
    @Transactional
    public void cancelAppointment(UUID appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn cần hủy.", HttpStatus.NOT_FOUND));

        //  Kiểm tra trạng thái hiện tại
        if (List.of(AppointmentStatus.CHECK_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED).contains(appointment.getStatus())) {
            throw new CustomException("Không thể hủy cuộc hẹn đã check-in hoặc đang diễn ra.", HttpStatus.BAD_REQUEST);
        }

        //  Logic kiểm tra thời gian: Bệnh nhân phải hủy trước 2 tiếng
        Schedule schedule = appointment.getSchedule();
        LocalDateTime appointmentTime = LocalDateTime.of(schedule.getWorkDate(), schedule.getTimeSlot().getStartTime());

        long hoursUntilAppointment = ChronoUnit.HOURS.between(LocalDateTime.now(), appointmentTime);
        if (hoursUntilAppointment < 2) {
            throw new CustomException("Chỉ có thể hủy lịch khám trước thời gian bắt đầu tối thiểu 2 tiếng.", HttpStatus.BAD_REQUEST);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        // Trả lại slot khám
        schedule.setCurrentPatients(Math.max(0, schedule.getCurrentPatients() - 1));
        if (schedule.getStatus() == ScheduleStatus.FULL) {
            schedule.setStatus(ScheduleStatus.AVAILABLE);
        }
        scheduleRepository.save(schedule);

        // Thông báo
        String formattedDate = schedule.getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String message = String.format("Lịch hẹn của bạn vào lúc %s ngày %s đã bị hủy. Lý do: %s",
                schedule.getTimeSlot().getStartTime(), formattedDate, reason);
        notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/appointments");
    }

    //Staff cập nhật trang thái lịch hẹn (confirmed và check_in)
    @Override
    @Transactional
    public void updateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));

        // Cập nhật trạng thái
        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        // Xử lý gửi thông báo dựa trên trạng thái mới
        switch (status) {
            case CONFIRMED -> {
                String message = "Lịch hẹn của bạn đã được xác nhận.";
                notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/appointments");
            }
            case CHECK_IN -> {
                String message = "Bạn đã check-in thành công. Vui lòng chờ đến lượt.";
                notificationService.createNotification(appointment.getPatient().getUser(), message, null);
            }
            default -> {} // Bỏ qua các trạng thái khác
        }
    }

    @Override
    public List<AppointmentResponseDTO> getPatientAppointmentHistory(UUID patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatient_PatientIdOrderBySchedule_WorkDateDesc(patientId);
        return appointments.stream()
                .map(appointmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorAppointmentHistory(UUID doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdAndStatusOrderBySchedule_WorkDateDesc(doctorId, AppointmentStatus.COMPLETED);
        return appointments.stream()
                .map(appointmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDTO> searchAppointmentsForStaff(String cccd, LocalDate date) {
        List<Appointment> appointments;
        if (cccd != null && !cccd.isEmpty()) {
            appointments = appointmentRepository.findByPatient_User_Cccd(cccd);
        } else if (date != null) {
            appointments = appointmentRepository.findBySchedule_WorkDate(date);
        } else {
            throw new CustomException("Vui lòng cung cấp CCCD hoặc ngày để tra cứu.", HttpStatus.BAD_REQUEST);
        }
        return appointments.stream()
                .map(appointmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorStatisticsResponseDTO getDoctorStatistics(UUID doctorId) {
        //chưa hoàn thiện
        return null;
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorUpcomingAppointments(UUID doctorId) {
        List<AppointmentStatus> upcomingStatus = Arrays.asList(AppointmentStatus.PENDING, AppointmentStatus.CHECK_IN);
        List<Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdAndStatusIn(doctorId, upcomingStatus);
        return appointments.stream()
                .map(appointmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void doctorUpdateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));

        if (status != AppointmentStatus.IN_PROGRESS && status != AppointmentStatus.COMPLETED) {
            throw new CustomException("Bác sĩ chỉ có thể chuyển trạng thái sang 'Đang khám' hoặc 'Hoàn tất'.", HttpStatus.BAD_REQUEST);
        }

        // Bác sĩ chỉ được IN_PROGRESS nếu trạng thái trước đó là CHECK_IN
        if (status == AppointmentStatus.IN_PROGRESS && appointment.getStatus() != AppointmentStatus.CHECK_IN) {
            throw new CustomException("Bệnh nhân chưa Check-in, không thể bắt đầu khám.", HttpStatus.BAD_REQUEST);
        }

        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        if (status == AppointmentStatus.COMPLETED) {
            String message = String.format("Cuộc hẹn với BS. %s đã hoàn tất. Vui lòng xem bệnh án.",
                    appointment.getDoctor().getUser().getFullName());
            notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/medical-records");
        }
    }
}

