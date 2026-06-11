package com.medicare.service.catalog;


import com.medicare.dto.request.DiseaseRequestDTO;
import com.medicare.dto.response.DiseaseResponseDTO;
import com.medicare.entity.Disease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DiseaseService {
    Page<DiseaseResponseDTO> getAllDiseases(String keyword, Pageable pageable);

    DiseaseResponseDTO createDisease(DiseaseRequestDTO request);

    DiseaseResponseDTO updateDisease(Integer id, DiseaseRequestDTO request);

    void deleteDisease(Integer id);
}