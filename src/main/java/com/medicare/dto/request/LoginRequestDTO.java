package com.medicare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {
    @Email (message = "Email không đúng định dạng")
    @NotBlank(message = "Tên đăng nhập không được để trống ")
    @Size(max=255, message = "Email không được vượt quá 255 ký tự ")
    private String email;
    @NotBlank(message = "Mật khẩu không được để trống ")
//    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
//            message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số")
    private String password;
}