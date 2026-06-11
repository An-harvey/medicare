package com.medicare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequestDTO {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Vui lòng nhập đúng định dạng email")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message ="Vui lòng nhập họ tên đầy đủ")
    private String fullName;

    @NotBlank(message="Số điện thoại không được bỏ trống")
    private String phone;
    @NotBlank(message = "Vui lòng nhập căn cước công dân")
    private String cccd;
    private String roleName; // DOCTOR hoặc STAFF
    private Integer specialtyId; // Chỉ bắt buộc nếu roleName là DOCTOR
}