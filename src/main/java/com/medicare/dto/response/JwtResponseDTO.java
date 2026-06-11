package com.medicare.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class JwtResponseDTO {
    private String token;
    private String email;
    private String role;
}