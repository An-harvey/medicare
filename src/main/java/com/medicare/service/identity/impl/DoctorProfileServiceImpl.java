package com.medicare.service.identity.impl;

import com.medicare.dto.request.AdminDoctorProfileUpdateRequestDTO;
import com.medicare.dto.request.DoctorProfileUpdateRequestDTO;
import com.medicare.dto.response.DoctorDetailResponseDTO;
import com.medicare.dto.response.DoctorResponseDTO;
import com.medicare.entity.DoctorProfile;
import com.medicare.exception.CustomException;
import com.medicare.mapper.ProfileMapper;
import com.medicare.repository.DoctorProfileRepository;
import com.medicare.service.identity.DoctorProfileService;
import com.medicare.utils.FileStorageService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorProfileServiceImpl implements DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final ProfileMapper profileMapper;

    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public DoctorDetailResponseDTO doctorUpdateProfile(DoctorProfileUpdateRequestDTO dto, MultipartFile avatarFile) {
        // Lấy ID trực tiếp từ Token để đảm bảo tính an toàn hệ thống
        UUID currentDoctorId = SecurityUtils.getCurrentUserId();

        DoctorProfile profile = doctorProfileRepository.findById(currentDoctorId)
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bác sĩ.", HttpStatus.NOT_FOUND));

        // Tiến hành cập nhật các trường thông tin được cho phép
        if(dto.getExpertiseDescription() !=null){
            profile.setExpertiseDescription(dto.getExpertiseDescription());}

        if(dto.getBiography() !=null){
            profile.setBiography(dto.getBiography());}

        //  Xử lý lưu ảnh nếu có file được gửi lên
        if (avatarFile != null && !avatarFile.isEmpty()) {
            // Lưu file xuống ổ cứng và lấy tên file (ví dụ: a1b2c3d4.jpg)
            String fileName = fileStorageService.storeFile(avatarFile);

            // Tạo đường dẫn tương đối
            // Kết quả sẽ dạng: api/images/a1b2c3d4.jpg
            String relativePath = "/api/images/" + fileName;

            // Lưu chuỗi URL vào cột image_url trong CSDL
            profile.setImageUrl(relativePath);
        }
        DoctorProfile updatedProfile = doctorProfileRepository.save(profile);
        return profileMapper.toDoctorDetailResponse(updatedProfile.getUser(), updatedProfile, updatedProfile.getSpecialty());
    }

    @Override
    @Transactional
    public DoctorDetailResponseDTO adminUpdateAcademicInfo(UUID doctorId, AdminDoctorProfileUpdateRequestDTO dto) {
        DoctorProfile profile = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bác sĩ yêu cầu.", HttpStatus.NOT_FOUND));

        // Admin ghi đè các thông tin năng lực chuyên môn chuyên sâu
        profile.setAcademicTitle(dto.getAcademicTitle());
        profile.setDegree(dto.getDegree());
        profile.setExperienceYears(dto.getExperienceYears());

        DoctorProfile updatedProfile = doctorProfileRepository.save(profile);
        return profileMapper.toDoctorDetailResponse(updatedProfile.getUser(), updatedProfile, updatedProfile.getSpecialty());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDetailResponseDTO getDoctorProfileById(UUID doctorId) {
        DoctorProfile profile = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new CustomException("Hồ sơ bác sĩ không tồn tại.", HttpStatus.NOT_FOUND));

        return profileMapper.toDoctorDetailResponse(profile.getUser(), profile, profile.getSpecialty());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> searchDoctors(String name, Integer specialtyId) {
        List<DoctorProfile> profiles;

        if (specialtyId != null) {
            // Lọc ưu tiên theo chuyên khoa trước
            profiles = doctorProfileRepository.findBySpecialty_Id(specialtyId);
        } else if (name != null && !name.trim().isEmpty()) {
            // Tìm kiếm tương đối dựa theo tên bác sĩ
            profiles = doctorProfileRepository.findByUser_FullNameContainingIgnoreCase(name);
        } else {
            // Trường hợp không truyền tham số lọc, lấy toàn bộ danh sách
            profiles = doctorProfileRepository.findAll();
        }

        return profiles.stream()
                .map(p -> profileMapper.toDoctorResponse(p.getUser(), p, p.getSpecialty()))
                .collect(Collectors.toList());
    }
}