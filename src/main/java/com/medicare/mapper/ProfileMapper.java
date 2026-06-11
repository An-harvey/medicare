package com.medicare.mapper;

import com.medicare.dto.response.DoctorDetailResponseDTO;
import com.medicare.dto.response.DoctorResponseDTO;
import com.medicare.entity.DoctorProfile;
import com.medicare.entity.Specialty;
import com.medicare.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    // Gộp 3 Entity thành 1 DTO duy nhất
    @Mapping(source = "user.id", target = "id")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "profile.imageUrl", target = "imageUrl")
    @Mapping(source = "profile.academicTitle", target = "academicTitle")
    @Mapping(source = "profile.experienceYears", target = "experienceYears")
    @Mapping(source = "specialty.name", target = "specialtyName")
    DoctorResponseDTO toDoctorResponse(User user, DoctorProfile profile, Specialty specialty);

    // Hàm map chi tiết đầy đủ phục vụ trang Profile Bác sĩ
    @Mapping(source = "profile.doctorId", target = "doctorId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "specialty.id", target = "specialtyId")
    @Mapping(source = "specialty.name", target = "specialtyName")
    DoctorDetailResponseDTO toDoctorDetailResponse(User user, DoctorProfile profile, Specialty specialty);
}