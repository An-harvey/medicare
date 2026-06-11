package com.medicare.repository;

import com.medicare.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {

    // Tìm bệnh án của một cuộc hẹn cụ thể
    Optional<MedicalRecord> findByAppointment_Id(UUID appointmentId);

    // Xem lịch sử khám bệnh của bệnh nhân sắp xếp từ mới đến cũ
    List<MedicalRecord> findByPatient_PatientIdOrderByAppointment_Schedule_WorkDateDesc(UUID patientId);

    // Bác sĩ xem lại các bệnh án đã tạo
    List<MedicalRecord> findByDoctor_DoctorIdOrderByAppointment_Schedule_WorkDateDesc(UUID doctorId);
}
