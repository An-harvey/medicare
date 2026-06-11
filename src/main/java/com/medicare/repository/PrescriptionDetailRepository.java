package com.medicare.repository;

import com.medicare.entity.PrescriptionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, UUID> {
    // Lấy chi tiết toàn bộ các thuốc trong một đơn thuốc
    List<PrescriptionDetail> findByPrescription_Id(UUID prescriptionId);
}