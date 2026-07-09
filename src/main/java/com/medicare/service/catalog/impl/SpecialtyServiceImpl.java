package com.medicare.service.catalog.impl;

import com.medicare.dto.request.SpecialtyRequestDTO;
import com.medicare.dto.response.SpecialtyResponseDTO;
import com.medicare.entity.Specialty;
import com.medicare.exception.CustomException;
import com.medicare.repository.DoctorProfileRepository;
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
    private final DoctorProfileRepository doctorProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }

    @Override
    @Transactional
    public SpecialtyResponseDTO createSpecialty(SpecialtyRequestDTO request) {
        if(specialtyRepository.existsByName(request.getName())){
            throw new CustomException("Chuyên khoa đã tồn tại", HttpStatus.BAD_REQUEST);
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
        if (!specialtyRepository.existsById(id)){
            throw new CustomException("Không tìm thấy chuyên khoa cần xóa.", HttpStatus.NOT_FOUND);
        }

        if (doctorProfileRepository.existsBySpecialty_Id(id)) {
            throw new CustomException("Không thể xóa: Chuyên khoa này đang có bác sĩ hoạt động trên hệ thống.", HttpStatus.BAD_REQUEST);
        }

        specialtyRepository.deleteById(id);
    }

    @Override
    @Transactional
    public SpecialtyResponseDTO updateSpecialty(Integer id, SpecialtyRequestDTO request){
        Specialty specialty= specialtyRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy chuyên khoa.", HttpStatus.NOT_FOUND));

        //Kiểm tra tên chuyên khoa đã tồn tại chưa
        if(specialtyRepository.existsByName(request.getName())){
            throw new CustomException("Chuyên khoa đã tồn tại", HttpStatus.BAD_REQUEST);
        }
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