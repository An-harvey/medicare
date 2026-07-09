package com.medicare.mapper;

import com.medicare.dto.response.DiseaseResponseDTO;
import com.medicare.dto.response.MedicineResponseDTO;
import com.medicare.entity.Disease;
import com.medicare.entity.Medicine;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CatalogMapper {
    DiseaseResponseDTO toDiseaseResponseDTO(Disease disease);
    MedicineResponseDTO toMedicineResponseDTO(Medicine medicine);
}