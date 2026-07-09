package com.medicare.service.identity;

import com.medicare.dto.request.PatientProfileUpdateRequestDTO;
import com.medicare.dto.response.PatientProfileResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface PatientProfileService {
    // Bệnh nhân tự cập nhật thông tin hồ sơ của mình
    PatientProfileResponseDTO updatePatientProfile(PatientProfileUpdateRequestDTO dto, MultipartFile avatarFile);

    // Lấy thông tin chi tiết hồ sơ bệnh nhân hiện tại
    PatientProfileResponseDTO getPatientProfile();

    // Bác sĩ xem hồ sơ của một bệnh nhân cụ thể
    PatientProfileResponseDTO getPatientProfileForDoctor(UUID patientId);
}
