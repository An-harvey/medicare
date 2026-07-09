package com.medicare.repository;

import com.medicare.entity.Appointment;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.PaymentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Bệnh nhân xem danh sách lịch hẹn của mình (
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByPatient_PatientIdOrderBySchedule_WorkDateDesc(UUID patientId);

    // Bác sĩ xem lịch hẹn theo ngày cụ thể
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByDoctor_DoctorIdAndSchedule_WorkDate(UUID doctorId, LocalDate workDate);

    // Bác sĩ xem các lịch hẹn sắp tới (PENDING, ARRIVED)
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByDoctor_DoctorIdAndStatusIn(UUID doctorId, List<AppointmentStatus> statuses);

    // Bác sĩ xem lại lịch sử các ca đã hoàn thành khám (COMPLETED)
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByDoctor_DoctorIdAndStatusOrderBySchedule_WorkDateDesc(UUID doctorId, AppointmentStatus status);

    // Nhân viên tra cứu lịch hẹn của bệnh nhân qua số CCCD
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByPatient_User_Cccd(String cccd);

    // Nhân viên lọc toàn bộ lịch hẹn hệ thống theo ngày cụ thể
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findBySchedule_WorkDate(LocalDate workDate);

    // Tìm danh sách lịch hẹn theo trạng thái, sắp xếp theo ngày khám tăng dần
    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "schedule.timeSlot"})
    List<Appointment> findByStatusOrderBySchedule_WorkDateAsc(AppointmentStatus status);

    // Dashboard: Đếm số lịch hẹn theo ngày
    long countBySchedule_WorkDate(LocalDate workDate);

    // Dashboard: Đếm lịch hẹn theo trạng thái
    long countByStatus(AppointmentStatus status);

    // Dashboard: Top 5 bác sĩ có nhiều ca khám nhất trong tháng
    @Query(value = "SELECT TOP 5 d.doctor_id, u.full_name, d.academic_title, s.name as specialty_name, d.rating, COUNT(a.id) as total_appointments " +
            "FROM Appointments a " +
            "JOIN Doctor_Profiles d ON a.doctor_id = d.doctor_id " +
            "JOIN Users u ON d.doctor_id = u.id " +
            "JOIN Specialties s ON d.specialty_id = s.id " +
            "WHERE MONTH(a.created_at) = :month AND YEAR(a.created_at) = :year " +
            "GROUP BY d.doctor_id, u.full_name, d.academic_title, s.name, d.rating " +
            "ORDER BY total_appointments DESC " , nativeQuery = true)
    List<Object[]> findTopDoctorsByMonth(@Param("month") int month, @Param("year") int year);

    // Dashboard: Thống kê lịch hẹn theo chuyên khoa
    @Query(value = "SELECT s.id, s.name, COUNT(a.id) as appointment_count " +
            "FROM Appointments a " +
            "JOIN Doctor_Profiles d ON a.doctor_id = d.doctor_id " +
            "JOIN Specialties s ON d.specialty_id = s.id " +
            "WHERE MONTH(a.created_at) = :month " +
            "GROUP BY s.id, s.name", nativeQuery = true)
    List<Object[]> countAppointmentsBySpecialty(@Param("month") int month);

    boolean existsByIdAndDoctor_DoctorIdAndPatient_PatientId(UUID appointmentId, UUID doctorId, UUID patientId);

    // Đếm số ca theo Bác sĩ, Trạng thái và Khoảng thời gian
    @Query("SELECT COUNT(a) FROM Appointment a JOIN a.schedule s WHERE s.doctorProfile.doctorId = :doctorId AND a.status = :status AND s.workDate BETWEEN :startDate AND :endDate")
    long countDoctorStatsByTime(
            @Param("doctorId") UUID doctorId,
            @Param("status") AppointmentStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Đếm tổng số ca theo Bác sĩ và Trạng thái (dành cho các ca đang chờ)
    @Query("SELECT COUNT(a) FROM Appointment a JOIN a.schedule s WHERE s.doctorProfile.doctorId = :doctorId AND a.status = :status")
    long countConfirmedByDoctor(
            @Param("doctorId") UUID doctorId,
            @Param("status") AppointmentStatus status
    );

    // Kiểm tra xem lịch làm việc có dính khóa ngoại từ cuộc hẹn nào không
    boolean existsBySchedule_Id(UUID scheduleId);

    // Kiểm tra xem bác sĩ có lịch hẹn với bệnh nhân cụ thể không
    boolean existsByDoctor_DoctorIdAndPatient_PatientId(UUID doctorId, UUID patientId);

    // Kiểm tra xem bệnh nhân đã có ca khám nào tại cùng ngày và cùng khung giờ chưa (Bỏ qua ca đã HỦY)
    boolean existsByPatient_PatientIdAndSchedule_WorkDateAndSchedule_TimeSlot_IdAndStatusNot(
            UUID patientId, LocalDate workDate, Integer timeSlotId, AppointmentStatus status);

    // Đếm tổng số ca khám bệnh nhân đã đặt trong một ngày (Bỏ qua ca đã HỦY)
    long countByPatient_PatientIdAndSchedule_WorkDateAndStatusNot(
            UUID patientId, LocalDate workDate, AppointmentStatus status);

    //CronJob, tìm các lịch hẹn năng trong một khung thời gian cụ thể nhưng chưa thanh toán
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.status IN :appStatuses " +
            "AND a.schedule.workDate = :workDate " +
            "AND a.schedule.timeSlot.startTime >= :startTime " +
            "AND a.schedule.timeSlot.startTime <= :endTime " +
            "AND EXISTS (SELECT 1 FROM Payment p WHERE p.appointment = a AND p.status = :paymentStatus)")
    List<Appointment> findUnpaidAppointmentsByTimeRange(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("appStatuses") List<AppointmentStatus> appStatuses,
            @Param("workDate") LocalDate workDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    //Tìm các lịch hẹn đã quá giờ chưa thanh toán
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.status IN :appStatuses " +
            "AND EXISTS (SELECT 1 FROM Payment p WHERE p.appointment = a AND p.status = :paymentStatus) " +
            "AND (a.schedule.workDate < :thresholdDate " +
            "     OR (a.schedule.workDate = :thresholdDate AND a.schedule.timeSlot.startTime <= :thresholdTime))")
    List<Appointment> findOverdueUnpaidAppointments(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("appStatuses") List<AppointmentStatus> appStatuses,
            @Param("thresholdDate") LocalDate thresholdDate,
            @Param("thresholdTime") LocalTime thresholdTime
    );
}