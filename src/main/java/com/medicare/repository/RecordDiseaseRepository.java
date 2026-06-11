package com.medicare.repository;

import com.medicare.entity.RecordDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RecordDiseaseRepository extends JpaRepository<RecordDisease, Long> {
    // Đã cập nhật kiểu khóa chính sang Long theo cấu trúc Surrogate Key mới của bạn
}