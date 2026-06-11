package com.medicare.service.catalog.impl;

import com.medicare.dto.request.SpecialtyRequestDTO;
import com.medicare.dto.response.SpecialtyResponseDTO;
import com.medicare.entity.Specialty;
import com.medicare.exception.CustomException;
import com.medicare.repository.SpecialtyRepository;
import com.medicare.service.catalog.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }

    @Override
    @Transactional
    public SpecialtyResponseDTO createSpecialty(SpecialtyRequestDTO request) {
        if(specialtyRepository.existsByName(request.getName())){
            throw new RuntimeException("Chuyên khoa đã tồn tại");
        }
        Specialty specialty = Specialty.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        Specialty savedSpecialty = specialtyRepository.save(specialty);

        return SpecialtyResponseDTO.builder()
                .name(savedSpecialty.getName())
                .description(savedSpecialty.getDescription())
                .build();
    }

    @Override
    @Transactional
    public void deleteSpecialty(Integer id) {
        specialtyRepository.deleteById(id);
    }

    @Override
    @Transactional
    public SpecialtyResponseDTO updateSpecialty(Integer id, SpecialtyRequestDTO request){
        Specialty specialty= specialtyRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy chuyên khoa.", HttpStatus.NOT_FOUND));
        if(request.getName() != null){
            specialty.setName(request.getName());
        }
        if(request.getDescription() != null){
            specialty.setDescription(request.getDescription());
        }

        Specialty savedSpecialty = specialtyRepository.save(specialty);
        return SpecialtyResponseDTO.builder()
                .name(savedSpecialty.getName())
                .description(savedSpecialty.getDescription())
                .build();
    }
}