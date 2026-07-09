package com.medicare.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class UserResponseDTO {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String cccd;
    private Boolean isActive;
    private Integer roleId;
    private String roleName; // Trả thêm tên Role (ADMIN, DOCTOR, STAFF, PATIENT) để hiển thị ở giao diện
}