package com.medicare.repository;

import com.medicare.entity.Schedule;
import com.medicare.enums.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

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
}