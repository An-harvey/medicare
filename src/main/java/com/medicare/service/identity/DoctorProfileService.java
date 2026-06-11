package com.medicare.service.identity;

import com.medicare.dto.request.AdminDoctorProfileUpdateRequestDTO;
import com.medicare.dto.request.DoctorProfileUpdateRequestDTO;
import com.medicare.dto.response.DoctorDetailResponseDTO;
import com.medicare.dto.response.DoctorResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DoctorProfileService {
    // Bác sĩ tự cập nhật thông tin được phép
    DoctorDetailResponseDTO doctorUpdateProfile(DoctorProfileUpdateRequestDTO dto, MultipartFile avatarFile);

    // Admin cập nhật thông tin học hàm, học vị, kinh nghiệm
    DoctorDetailResponseDTO adminUpdateAcademicInfo(UUID doctorId, AdminDoctorProfileUpdateRequestDTO dto);

    // Xem chi tiết hồ sơ một bác sĩ
    DoctorDetailResponseDTO getDoctorProfileById(UUID doctorId);

    // Tìm kiếm công khai theo tên hoặc theo chuyên khoa
    List<DoctorResponseDTO> searchDoctors(String name, Integer specialtyId);
}