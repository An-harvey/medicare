package com.medicare.service.catalog;

import com.medicare.dto.request.MedicineRequestDTO;
import com.medicare.dto.response.MedicineResponseDTO;
import com.medicare.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MedicineService {
    Page<MedicineResponseDTO> getAllMedicines(String keyword, Pageable pageable);
    Medicine createMedicine(Medicine medicine);
    void deleteMedicine(Integer id);
    MedicineResponseDTO updateMedicine(Integer id, MedicineRequestDTO request);
}