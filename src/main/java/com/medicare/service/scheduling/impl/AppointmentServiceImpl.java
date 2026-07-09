package com.medicare.service.scheduling.impl;

import com.medicare.dto.request.AppointmentRequestDTO;
import com.medicare.dto.response.AppointmentResponseDTO;
import com.medicare.dto.response.DoctorStatisticsResponseDTO;
import com.medicare.entity.*;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.PaymentStatus;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
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
    private final PaymentRepository paymentRepository;

    //Bệnh nhân đặt lịch khám trên web
    @Override
    @Transactional
    public AppointmentResponseDTO patientBookAppointment(AppointmentRequestDTO dto) {
        User currentUser = SecurityUtils.getCurrentUser();
        PatientProfile patientProfile = patientProfileRepository.findById(currentUser.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bệnh nhân.", HttpStatus.NOT_FOUND));

        // Bệnh nhân tự đặt -> Trạng thái PENDING
        return processBooking(patientProfile, currentUser, dto, AppointmentStatus.PENDING,false);
    }

    //Bệnh nhân gọi điện/đến trực tiếp gặp staff đặt lịch
    @Override
    @Transactional
    public AppointmentResponseDTO staffBookAppointment(UUID patientId, AppointmentRequestDTO dto) {
        User staffUser = SecurityUtils.getCurrentUser();
        PatientProfile patientProfile = patientProfileRepository.findById(patientId)
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bệnh nhân với ID: " + patientId, HttpStatus.NOT_FOUND));

        // Staff đặt hộ -> Trạng thái mặc định là CONFIRMED
        return processBooking(patientProfile, staffUser, dto, AppointmentStatus.CONFIRMED, true);
    }


    //Xử lý đặt lịch (từ patient và staff)
    private AppointmentResponseDTO processBooking(PatientProfile patient, User createdBy, AppointmentRequestDTO dto, AppointmentStatus initialStatus, boolean isStaffBooking) {
        Schedule schedule = scheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new CustomException("Lịch khám không tồn tại hoặc đã bị xóa.", HttpStatus.NOT_FOUND));

        if (schedule.getStatus() == ScheduleStatus.FULL || schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new CustomException("Lịch khám này đã đầy hoặc đã bị hủy bỏ, không thể đặt thêm.", HttpStatus.BAD_REQUEST);
        }

        //Chống đặt lịch trong quá khứ
        LocalDateTime appointmentTime = LocalDateTime.of(schedule.getWorkDate(), schedule.getTimeSlot().getStartTime());
        if (appointmentTime.isBefore(LocalDateTime.now())) {
            throw new CustomException("Không thể đặt lịch khám trong quá khứ.", HttpStatus.BAD_REQUEST);
        }


        //Chống đặt trùng khung giờ ( Một người không thể khám 2 bác sĩ cùng lúc )
        boolean isTimeSlotOverlapped = appointmentRepository
                .existsByPatient_PatientIdAndSchedule_WorkDateAndSchedule_TimeSlot_IdAndStatusNot(
                patient.getPatientId(),
                schedule.getWorkDate(),
                schedule.getTimeSlot().getId(),
                AppointmentStatus.CANCELLED);

        if (isTimeSlotOverlapped) {
            throw new CustomException("Bạn đã có một lịch hẹn khác vào khung giờ này." +
                    " Vui lòng chọn khung giờ hoặc ngày khác.", HttpStatus.BAD_REQUEST);
        }

        //Chống spam: giới hạn mỗi bệnh nhân chỉ được đặt tối đa 2 lịch khám / ngày
        if (!isStaffBooking) {
            long totalAppointmentsToday = appointmentRepository.countByPatient_PatientIdAndSchedule_WorkDateAndStatusNot(
                    patient.getPatientId(),
                    schedule.getWorkDate(),
                    AppointmentStatus.CANCELLED
            );

            if (totalAppointmentsToday >= 2) {
                throw new CustomException("Bạn đã đạt giới hạn đặt tối đa 2 ca khám trong cùng một ngày. Vui lòng liên hệ phòng khám nếu cần hỗ trợ thêm.", HttpStatus.TOO_MANY_REQUESTS);
            }
        }

        //Thực hiện điều kiện schedule trước tránh cả 2 cùng đặt
        int updatedRows = scheduleRepository.bookSlotSafely(
                schedule.getId(),
                ScheduleStatus.FULL,
                ScheduleStatus.AVAILABLE
        );
        if (updatedRows == 0) {
            throw new CustomException("Rất tiếc, lịch khám vừa được người khác đặt kín chỗ." +
                    " Vui lòng chọn khung giờ khác.", HttpStatus.CONFLICT);
        }

        //Lấy lại thông tin lịch khám mới nhất từ Database
        schedule = scheduleRepository.findById(schedule.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin lịch khám sau khi đặt.", HttpStatus.NOT_FOUND));

        // Tạo mới cuộc hẹn
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(schedule.getDoctorProfile())
                .schedule(schedule)
                .createdBy(createdBy)
                .symptoms(dto.getSymptoms())
                .status(initialStatus)
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        //Xử lý tạo Payment
        Payment payment = Payment.builder()
                .appointment(savedAppointment)
                .amount(schedule.getDoctorProfile().getFee()) // Lấy phí khám của bác sĩ
                .status(PaymentStatus.UNPAID)
                .build();
        paymentRepository.save(payment);

        // Thông báo
        String formattedDate = savedAppointment.getSchedule().getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String message = String.format(
                "Quý khách đã đặt lịch thành công với BS. %s lúc %s ngày %s. " +
                        "Quý khách có thể thanh toán online trên hệ thống," +
                        " hoặc vui lòng có mặt trước 30 phút để làm thủ tục thanh toán tại quầy.",
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

        // Kiểm tra xác minh lịch hẹn có phải của bênh nhân không, tránh hủy của người khác khi có appointmentId
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!appointment.getPatient().getPatientId().equals(currentUserId)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa hoặc hủy lịch hẹn của người khác.", HttpStatus.FORBIDDEN);
        }
        //  Kiểm tra trạng thái hiện tại
        if (List.of(AppointmentStatus.CHECK_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED).contains(appointment.getStatus())) {
            throw new CustomException("Không thể hủy cuộc hẹn đã check-in hoặc đang diễn ra.", HttpStatus.BAD_REQUEST);
        }

        //  Logic kiểm tra thời gian: Bệnh nhân phải hủy trước 2 tiếng
        Schedule schedule = appointment.getSchedule();
        LocalDateTime appointmentTime = LocalDateTime.of(schedule.getWorkDate(), schedule.getTimeSlot().getStartTime());

        long hoursUntilAppointment = ChronoUnit.HOURS.between(LocalDateTime.now(), appointmentTime);
        if (hoursUntilAppointment < 1) {
            throw new CustomException("Chỉ có thể hủy lịch khám trước thời gian bắt đầu tối thiểu 1 tiếng."
                    , HttpStatus.BAD_REQUEST);
        }

        //Chặn hủy nếu đã thanh toán
        Payment payment = paymentRepository.findByAppointment_Id(appointmentId).orElse(null);
        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            throw new CustomException("Không thể tự hủy lịch khám đã thanh toán thành công." +
                    " Vui lòng liên hệ hotline phòng khám để được hỗ trợ thủ tục hoàn tiền.", HttpStatus.BAD_REQUEST);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        // Trả lại slot khám
        scheduleRepository.cancelSlotSafely(
                schedule.getId(),
                ScheduleStatus.FULL,
                ScheduleStatus.AVAILABLE);

        // Thông báo
        String formattedDate = schedule.getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String message = String.format("Lịch hẹn của bạn vào lúc %s ngày %s đã bị hủy. Lý do: %s",
                schedule.getTimeSlot().getStartTime(), formattedDate, reason);
        notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/appointments");
    }

    //Staf lấy danh sách lịch hẹn ở trang thái Pending
    @Override
    public List<AppointmentResponseDTO> getPendingAppointmentsForStaff() {
        List<Appointment> pendingAppointments = appointmentRepository
                .findByStatusOrderBySchedule_WorkDateAsc(AppointmentStatus.PENDING);

        return pendingAppointments.stream()
                .map(appointmentMapper::toResponseDTO) // Dùng mapper có sẵn của bạn
                .collect(Collectors.toList());
    }

    //Staff cập nhật trang thái lịch hẹn (confirmed và check_in)
    @Override
    @Transactional
    public void staffupdateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));

        //  Chỉ cho phép Staff cập nhật các trạng thái hợp lệ
        List<AppointmentStatus> allowedStatusesForStaff = List.of(
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECK_IN,
                AppointmentStatus.CANCELLED
        );

        if (!allowedStatusesForStaff.contains(status)) {
            throw new CustomException(" Lễ tân không có quyền cập nhật trạng thái này (chỉ được phép: CONFIRMED, CHECK_IN, CANCELLED).", HttpStatus.FORBIDDEN);
        }
        AppointmentStatus currentStatus = appointment.getStatus();

        //Chặn tuyệt đối mọi tác động lên lịch hẹn đã hủy, đang khám hoặc đã xong
        if (currentStatus == AppointmentStatus.CANCELLED ||
                currentStatus == AppointmentStatus.IN_PROGRESS ||
                currentStatus == AppointmentStatus.COMPLETED) {
            throw new CustomException("Không thể cập nhật trạng thái khi cuộc hẹn đã bị hủy," +
                    " đang diễn ra hoặc đã hoàn tất.", HttpStatus.BAD_REQUEST);
        }

        //Nếu bệnh nhân đã CHECK_IN thì không được chuyển ngược về Confirmed hay Cancelled
        if (currentStatus == AppointmentStatus.CHECK_IN) {
            throw new CustomException("Bệnh nhân đã check-in, vui lòng chờ bác sĩ khám," +
                    " không thể lùi trạng thái hoặc hủy.", HttpStatus.BAD_REQUEST);
        }

        //  Từ PENDING chỉ được chuyển sang CONFIRMED hoặc CANCELLED
        if (currentStatus == AppointmentStatus.PENDING && status != AppointmentStatus.CONFIRMED
                && status != AppointmentStatus.CANCELLED) {
            throw new CustomException("Bệnh nhân chưa được xác nhận lịch hẹn.", HttpStatus.BAD_REQUEST);
        }

        //  Muốn CHECK_IN thì trạng thái hiện tại phải là CONFIRMED và đã thanh toán
        if (status == AppointmentStatus.CHECK_IN){
            if( currentStatus != AppointmentStatus.CONFIRMED) {
                throw new CustomException("Xác nhận lịch hẹn trước khi tiến hành CHECK_IN", HttpStatus.BAD_REQUEST);
            }
            // Kiểm tra hóa đơn đã thanh toán chưa
            Payment payment = paymentRepository.findByAppointment_Id(appointmentId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy thông tin hóa đơn của lịch hẹn này."
                            , HttpStatus.NOT_FOUND));

            if (payment.getStatus() != PaymentStatus.PAID) {
                throw new CustomException("Bệnh nhân chưa hoàn tất thanh toán phí khám. Không thể Check-in!"
                        , HttpStatus.PAYMENT_REQUIRED);
            }
        }

        // Cập nhật trạng thái
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
        

        //Hoàn trả lại slot khám nếu Staff hủy lịch
        if (status == AppointmentStatus.CANCELLED) {
            scheduleRepository.cancelSlotSafely(
                    appointment.getSchedule().getId(),
                    ScheduleStatus.FULL,
                    ScheduleStatus.AVAILABLE
            );
        }

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
            case CANCELLED -> {
                String formattedDate = appointment.getSchedule().getWorkDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                String message = String.format("Lịch hẹn của bạn vào lúc %s ngày %s đã bị hủy bởi phòng khám.",
                        appointment.getSchedule().getTimeSlot().getStartTime(), formattedDate);
                notificationService.createNotification(appointment.getPatient().getUser(), message, "/patient/appointments");
            }
            default -> {}
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
        LocalDate today = LocalDate.now();
        //Xác định khoản thời gian tuần này (từ thứ 2 đến chủ nhật)
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // Xác định khoảng thời gian cho Tháng này (Từ ngày 1 đến ngày cuối tháng)
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        AppointmentStatus examinedStatus = AppointmentStatus.COMPLETED;
        AppointmentStatus confirmedStatus = AppointmentStatus.CONFIRMED;

        long examinedThisWeek = appointmentRepository.countDoctorStatsByTime(
                doctorId, examinedStatus, startOfWeek, endOfWeek);

        long examinedThisMonth = appointmentRepository.countDoctorStatsByTime(
                doctorId, examinedStatus, startOfMonth, endOfMonth);

        long pendingAppointments = appointmentRepository.countConfirmedByDoctor(
                doctorId, confirmedStatus);

        return DoctorStatisticsResponseDTO.builder()
                .totalExaminedThisWeek(examinedThisWeek)
                .totalExaminedThisMonth(examinedThisMonth)
                .totalPendingAppointments(pendingAppointments)
                .build();
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorUpcomingAppointments(UUID doctorId) {
        List<AppointmentStatus> upcomingStatus = Arrays.asList(AppointmentStatus.CONFIRMED, AppointmentStatus.CHECK_IN);
        List<Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdAndStatusIn(doctorId, upcomingStatus);
        return appointments.stream()
                .map(appointmentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponseDTO doctorUpdateAppointmentStatus(UUID appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cuộc hẹn.", HttpStatus.NOT_FOUND));

        //Kiểm tra quyền sở hữu, tránh cập nhật lịch hẹn của bác sĩ khác
        UUID currentDoctorId = SecurityUtils.getCurrentUserId();
        if (!appointment.getDoctor().getDoctorId().equals(currentDoctorId)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa hoặc cập nhật trạng thái cuộc hẹn của bác sĩ khác.", HttpStatus.FORBIDDEN);
        }

        //Bác sĩ chỉ được chủ động chuyển sang 'IN_PROGRESS' (Bắt đầu khám)
        if (status != AppointmentStatus.IN_PROGRESS) {
            throw new CustomException("Bác sĩ chỉ có thể chuyển trạng thái sang 'Đang khám'. Trạng thái 'Hoàn tất' sẽ tự động hệ thống cập nhật sau khi tạo bệnh án.", HttpStatus.BAD_REQUEST);
        }

        // Bác sĩ chỉ được IN_PROGRESS nếu trạng thái trước đó là CHECK_IN
        if (appointment.getStatus() != AppointmentStatus.CHECK_IN) {
            throw new CustomException("Bệnh nhân chưa Check-in tại quầy tiếp đón, không thể bắt đầu khám.", HttpStatus.BAD_REQUEST);
        }

        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        return appointmentMapper.toResponseDTO(appointment);
    }
}

