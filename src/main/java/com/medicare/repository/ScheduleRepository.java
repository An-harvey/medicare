package com.medicare.repository;

import com.medicare.entity.Schedule;
import com.medicare.enums.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    // Kiểm tra lịch khám trùng lặp của bác sĩ theo ngày và khung giờ
    boolean existsByDoctorProfile_DoctorIdAndWorkDateAndTimeSlot_Id(UUID doctorId, LocalDate workDate, Integer timeSlotId);

    // Bác sĩ xem lịch làm việc của mình theo ngày/tuần
    List<Schedule> findByDoctorProfile_DoctorIdAndWorkDate(UUID doctorId, LocalDate workDate);
    List<Schedule> findByDoctorProfile_DoctorIdAndWorkDateBetween(UUID doctorId, LocalDate start, LocalDate end);

    // Bệnh nhân tìm các khung giờ khám còn trống của một bác sĩ trong ngày
    List<Schedule> findByDoctorProfile_DoctorIdAndWorkDateAndStatus(UUID doctorId, LocalDate workDate, ScheduleStatus status);

    //Admin lấy lịch
    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.doctorProfile dp " +
            "JOIN FETCH dp.user u " +
            "JOIN FETCH s.timeSlot ts " +
            "WHERE (:doctorId IS NULL OR dp.doctorId = :doctorId) " +
            "AND (:workDate IS NULL OR s.workDate = :workDate) " +
            "AND (:specialtyId IS NULL OR dp.specialty.id = :specialtyId)")
    Page<Schedule> findAllSchedulesWithFilter(@Param("doctorId") UUID doctorId,
                                              @Param("workDate") LocalDate workDate,
                                              @Param("specialtyId") Integer specialtyId,
                                              Pageable pageable);

    // Xử lý tránh cùng đặt lịch 1 thời điểm
    @Modifying
    @Query("UPDATE Schedule s SET s.currentPatients = s.currentPatients + 1, " +
            "s.status = CASE WHEN (s.currentPatients + 1) = s.maxPatients THEN :fullStatus ELSE s.status END " +
            "WHERE s.id = :scheduleId AND s.currentPatients < s.maxPatients AND s.status = :availableStatus")
    int bookSlotSafely(@Param("scheduleId") UUID scheduleId,
                       @Param("fullStatus") ScheduleStatus fullStatus,
                       @Param("availableStatus") ScheduleStatus availableStatus);

    // Kiểm tra xem Khung giờ đã được sử dụng trong lịch làm việc chưa
    boolean existsByTimeSlot_Id(Integer timeSlotId);

    // Xử lý hoàn trả slot an toàn để tránh Race Condition khi Hủy lịch
    @Modifying
    @Query("UPDATE Schedule s SET s.currentPatients = s.currentPatients - 1, " +
            "s.status = CASE WHEN s.status = :fullStatus THEN :availableStatus ELSE s.status END " +
            "WHERE s.id = :scheduleId AND s.currentPatients > 0")
    int cancelSlotSafely(@Param("scheduleId") UUID scheduleId,
                         @Param("fullStatus") ScheduleStatus fullStatus,
                         @Param("availableStatus") ScheduleStatus availableStatus);

}