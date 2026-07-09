package com.medicare.service.identity.impl;

import com.medicare.dto.request.PatientProfileUpdateRequestDTO;
import com.medicare.dto.response.PatientProfileResponseDTO;
import com.medicare.entity.PatientProfile;
import com.medicare.exception.CustomException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.PatientProfileRepository;
import com.medicare.service.identity.PatientProfileService;
import com.medicare.utils.FileStorageService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientProfileServiceImpl implements PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public PatientProfileResponseDTO updatePatientProfile(PatientProfileUpdateRequestDTO dto, MultipartFile avatarFile) {
        UUID currentPatientId = SecurityUtils.getCurrentUserId();

        PatientProfile profile = patientProfileRepository.findById(currentPatientId)
                .orElseThrow(() -> new CustomException("Hồ sơ bệnh nhân không tồn tại.", HttpStatus.NOT_FOUND));
        if(dto.getDob() !=null){
        profile.setDob(dto.getDob());}

        if(dto.getBloodType() !=null){
        profile.setBloodType(dto.getBloodType());}

        if(dto.getAllergyHistory() != null) {
        profile.setAllergyHistory(dto.getAllergyHistory());}

        if(dto.getPersonalMedicalHistory() !=null){
        profile.setPersonalMedicalHistory(dto.getPersonalMedicalHistory());}

        if(dto.getFamilyMedicalHistory() != null){
        profile.setFamilyMedicalHistory(dto.getFamilyMedicalHistory());}

        //  Xử lý Upload Ảnh nếu người dùng có chọn ảnh mới
        if (avatarFile != null && !avatarFile.isEmpty()) {
            // Lưu file xuống ổ cứng và lấy tên file sinh ra (VD: uuid.jpg)
            String fileName = fileStorageService.storeFile(avatarFile);

            // Cập nhật tên ảnh vàoDB
            profile.setImageUrl(fileName);

        } else if (dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
            // Trường hợp không gửi file mới, nhưng có truyền text URL cũ lên thì giữ nguyên
            profile.setImageUrl(dto.getImageUrl());
        }

        PatientProfile updated = patientProfileRepository.save(profile);
        return mapToPatientResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponseDTO getPatientProfile() {
        UUID currentPatientId = SecurityUtils.getCurrentUserId();
        PatientProfile profile = patientProfileRepository.findById(currentPatientId)
                .orElseThrow(() -> new CustomException("Hồ sơ không tồn tại.", HttpStatus.NOT_FOUND));
        return mapToPatientResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponseDTO getPatientProfileForDoctor(UUID patientId) {
        UUID doctorId = SecurityUtils.getCurrentUserId();

        // Kiểm tra xem bác sĩ có cuộc hẹn nào với bệnh nhân này không để đảm bảo quyền riêng tư
        boolean hasAppointment = appointmentRepository.existsByDoctor_DoctorIdAndPatient_PatientId(doctorId, patientId);

        if (!hasAppointment) {
            throw new CustomException("Bạn không có quyền xem hồ sơ của bệnh nhân này.", HttpStatus.FORBIDDEN);
        }

        PatientProfile profile = patientProfileRepository.findById(patientId)
                .orElseThrow(() -> new CustomException("Hồ sơ bệnh nhân không tồn tại.", HttpStatus.NOT_FOUND));
        return mapToPatientResponse(profile);
    }

    private PatientProfileResponseDTO mapToPatientResponse(PatientProfile entity) {
        return PatientProfileResponseDTO.builder()
                .patientId(entity.getPatientId())
                .fullName(entity.getUser().getFullName())
                .email(entity.getUser().getEmail())
                .phone(entity.getUser().getPhone())
                .cccd(entity.getUser().getCccd())
                .dob(entity.getDob())
                .bloodType(entity.getBloodType())
                .allergyHistory(entity.getAllergyHistory())
                .personalMedicalHistory(entity.getPersonalMedicalHistory())
                .familyMedicalHistory(entity.getFamilyMedicalHistory())
                .imageUrl(entity.getImageUrl())
                .build();
    }
}
