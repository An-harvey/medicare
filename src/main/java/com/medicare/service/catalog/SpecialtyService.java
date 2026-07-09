package com.medicare.service.catalog;

import com.medicare.dto.request.SpecialtyRequestDTO;
import com.medicare.dto.response.SpecialtyResponseDTO;
import com.medicare.entity.Specialty;
import java.util.List;

public interface SpecialtyService {
    List<Specialty> getAllSpecialties();
    SpecialtyResponseDTO createSpecialty(SpecialtyRequestDTO request);
    void deleteSpecialty(Integer id);

    //Cập nhật dữ liệu chuyên khoa
    SpecialtyResponseDTO updateSpecialty(Integer id, SpecialtyRequestDTO request);
}