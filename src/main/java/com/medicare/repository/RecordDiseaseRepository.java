package com.medicare.repository;

import com.medicare.entity.RecordDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RecordDiseaseRepository extends JpaRepository<RecordDisease, Long> {
    // Kiểm tra xem bệnh lý đã được ghi vào bệnh án nào chưa
    boolean existsByDisease_Id(Integer diseaseId);

}