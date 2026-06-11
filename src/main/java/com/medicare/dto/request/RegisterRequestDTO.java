package com.medicare.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String cccd;
}