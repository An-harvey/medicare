package com.medicare.service.catalog.impl;


import com.medicare.dto.request.DiseaseRequestDTO;
import com.medicare.dto.response.DiseaseResponseDTO;
import com.medicare.entity.Disease;
import com.medicare.exception.CustomException;
import com.medicare.mapper.CatalogMapper;
import com.medicare.repository.DiseaseRepository;
import com.medicare.service.catalog.DiseaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;
    private final CatalogMapper catalogMapper;

    @Override
    public Page<DiseaseResponseDTO> getAllDiseases(String keyword, Pageable pageable) {
        return diseaseRepository.findAllWithFilter(keyword, pageable)
                .map(catalogMapper::toDiseaseResponseDTO);
    }

    @Override
    @Transactional
    public DiseaseResponseDTO createDisease(DiseaseRequestDTO request) {
        if (diseaseRepository.findByCode(request.getCode()).isPresent()) {
            throw new CustomException("Mã bệnh lý ICD này đã tồn tại.");
        }
        Disease disease = Disease.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .build();
        Disease savedDisease=diseaseRepository.save(disease);
        return DiseaseResponseDTO.builder()
                .code(savedDisease.getCode())
                .name(savedDisease.getName())
                .description(savedDisease.getDescription())
                .build();
    }

    @Override
    @Transactional
    public DiseaseResponseDTO updateDisease(Integer id, DiseaseRequestDTO request) {
        Disease disease = diseaseRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy bệnh lý yêu cầu.", HttpStatus.NOT_FOUND));
        if(request.getCode() != null){
            disease.setCode(request.getCode());
        }
        if(request.getDescription() != null){
            disease.setDescription(request.getDescription());
        }
        if(request.getName() != null){
            disease.setName(request.getName());
        }
        Disease savedDisease = diseaseRepository.save(disease);

        return catalogMapper.toDiseaseResponseDTO(savedDisease);
    }

    @Override
    @Transactional
    public void deleteDisease(Integer id) {
        if (!diseaseRepository.existsById(id)) {
            throw new CustomException("Bệnh lý không tồn tại để xóa.", HttpStatus.NOT_FOUND);
        }
        diseaseRepository.deleteById(id); //
    }
}