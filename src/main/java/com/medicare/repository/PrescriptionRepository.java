package com.medicare.repository;

import com.medicare.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    // Tìm đơn thuốc dựa trên ID bệnh án
    Optional<Prescription> findByMedicalRecord_Id(UUID medicalRecordId);
}