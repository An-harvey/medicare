package com.medicare.repository;

import com.medicare.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
    List<Medicine> findByNameContainingIgnoreCase(String name); // Tìm kiếm thuốc theo tên

    // Tìm kiếm theo tên Thuốc
    @Query("SELECT m FROM Medicine m WHERE " +
            "(:keyword IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Medicine> findAllWithFilter(@Param("keyword") String keyword, Pageable pageable);
}