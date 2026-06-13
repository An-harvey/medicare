package com.medicare.repository;

import com.medicare.entity.Appointment;
import com.medicare.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Bệnh nhân xem danh sách lịch hẹn của mình
    List<Appointment> findByPatient_PatientIdOrderBySchedule_WorkDateDesc(UUID patientId);

    // Bác sĩ xem lịch hẹn theo ngày cụ thể
    List<Appointment> findByDoctor_DoctorIdAndSchedule_WorkDate(UUID doctorId, LocalDate workDate);

    // Bác sĩ xem các lịch hẹn sắp tới (PENDING, ARRIVED)
    List<Appointment> findByDoctor_DoctorIdAndStatusIn(UUID doctorId, List<AppointmentStatus> statuses);

    //  Bác sĩ xem lại lịch sử các ca đã hoàn thành khám (COMPLETED)
    List<Appointment> findByDoctor_DoctorIdAndStatusOrderBySchedule_WorkDateDesc(UUID doctorId, AppointmentStatus status);

    // Nhân viên tra cứu lịch hẹn của bệnh nhân qua số CCCD
    List<Appointment> findByPatient_User_Cccd(String cccd);

    //  Nhân viên lọc toàn bộ lịch hẹn hệ thống theo ngày cụ thể
    List<Appointment> findBySchedule_WorkDate(LocalDate workDate);

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
}
