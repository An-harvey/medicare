package com.medicare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {
    @NotBlank(message = "Email không được bỏ trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống ")
    private String password;

    @NotBlank(message = "Vui lòng điền đầy đủ Họ và tên")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được bỏ trống")
    private String phone;

    @NotBlank(message = "Căn cước không dân không được bỏ trống")
    private String cccd;
}