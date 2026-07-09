package com.medicare.repository;

import com.medicare.entity.Disease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Integer> {
    Optional<Disease> findByCode(String code); // Tra cứu theo mã ICD

    // Tìm kiếm theo Mã bệnh hoặc Tên bệnh
    @Query("SELECT d FROM Disease d WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(d.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Disease> findAllWithFilter(@Param("keyword") String keyword, Pageable pageable);
}