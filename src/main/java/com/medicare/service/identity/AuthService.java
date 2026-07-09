package com.medicare.service.identity;

import com.medicare.dto.request.*;
import com.medicare.dto.response.JwtResponseDTO;

public interface AuthService {
    JwtResponseDTO login(LoginRequestDTO request);
    String registerPatient(RegisterRequestDTO request);
    String forgotPassword(ForgotPasswordRequestDTO request);
    String resetPassword(ResetPasswordRequestDTO request);
}