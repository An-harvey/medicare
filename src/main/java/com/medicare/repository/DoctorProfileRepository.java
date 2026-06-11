package com.medicare.repository;

import com.medicare.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {

    // Lọc danh sách bác sĩ theo ID chuyên khoa
    List<DoctorProfile> findBySpecialty_Id(Integer specialtyId);

    // Tìm kiếm bác sĩ theo tên (tìm tương đối LIKE %name%)
    List<DoctorProfile> findByUser_FullNameContainingIgnoreCase(String name);

    // Dashboard: Đếm số bác sĩ có lịch làm việc hôm nay
    @Query("SELECT COUNT(DISTINCT s.doctorProfile.doctorId) FROM Schedule s WHERE s.workDate = :date")
    long countActiveDoctorsByDate(LocalDate date);
}
