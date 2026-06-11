package com.medicare.service.identity;

import com.medicare.dto.request.LoginRequestDTO;
import com.medicare.dto.request.RegisterRequestDTO;
import com.medicare.dto.response.JwtResponseDTO;

public interface AuthService {
    JwtResponseDTO login(LoginRequestDTO request);
    String registerPatient(RegisterRequestDTO request);
}