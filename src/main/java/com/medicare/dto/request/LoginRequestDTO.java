package com.medicare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {
    @Email (message = "Vui lòng nhập đúng định dạng email")
    @NotBlank(message = "Vui lòng nhập email")
    private String email;
    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}