package com.medicare.service.identity;

import com.medicare.dto.request.UserCreateRequestDTO;
import com.medicare.dto.response.UserResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    // Admin khởi tạo tài khoản cho Doctor hoặc Staff
    UUID createUserAccount(UserCreateRequestDTO dto);

    // Admin thay đổi trạng thái hoạt động (Khóa/Mở khóa tài khoản)
    void toggleUserStatus(UUID userId, Boolean isActive);

    //Admin lấy danh sách User
    Page<UserResponseDTO> getAllUsers(String keyword, Integer roleId, Pageable pageable);
}