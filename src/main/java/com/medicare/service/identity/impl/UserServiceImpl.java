package com.medicare.service.identity.impl;

import com.medicare.dto.request.UserCreateRequestDTO;
import com.medicare.dto.response.UserResponseDTO;
import com.medicare.entity.*;
import com.medicare.exception.CustomException;
import com.medicare.mapper.UserMapper;
import com.medicare.repository.*;
import com.medicare.service.identity.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;


    @Override
    @Transactional
    public UUID createUserAccount(UserCreateRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("Email đã tồn tại trên hệ thống.");
        }

        Role role = roleRepository.findByRoleName(dto.getRoleName().toUpperCase())
                .orElseThrow(() -> new CustomException("Vai trò tài khoản không hợp lệ."));

        User user = User.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .cccd(dto.getCccd())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Logic đặc biệt: Nếu tạo DOCTOR, tự động khởi tạo DoctorProfile đi kèm
        if ("DOCTOR".equalsIgnoreCase(dto.getRoleName())) {
            if (dto.getSpecialtyId() == null) {
                throw new CustomException("Bắt buộc phải chọn chuyên khoa chính khi tạo tài khoản Bác sĩ.");
            }
            Specialty specialty = specialtyRepository.findById(dto.getSpecialtyId())
                    .orElseThrow(() -> new CustomException("Chuyên khoa được chọn không tồn tại.", HttpStatus.NOT_FOUND));

            DoctorProfile doctorProfile = DoctorProfile.builder()
                    .user(savedUser)
                    .specialty(specialty)
                    .experienceYears(0) // Khởi tạo mặc định
                    .build();

            doctorProfileRepository.save(doctorProfile);
        }

        return savedUser.getId();
    }

    @Override
    @Transactional
    public void toggleUserStatus(UUID userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy tài khoản yêu cầu.", HttpStatus.NOT_FOUND));
        user.setIsActive(isActive);
        userRepository.save(user);
    }

    @Override
    public Page<UserResponseDTO> getAllUsers(String keyword, Integer roleId, Pageable pageable) {
        Page<User> userPage = userRepository.findAllUsersWithFilter(keyword, roleId, pageable);
        // Chuyển đổi toàn bộ danh sách Entity sang DTO bằng MapStruct qua Stream Java 8+
        return userPage.map(userMapper::toUserResponseDTO);
    }
}