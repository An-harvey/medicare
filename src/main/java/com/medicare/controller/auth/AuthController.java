package com.medicare.controller.auth;

import com.medicare.dto.request.*;
import com.medicare.dto.response.JwtResponseDTO;
import com.medicare.service.identity.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login : Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@Validated @RequestBody LoginRequestDTO loginRequest) {
        JwtResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/register : Đăng ký tài khoản Patient mặc định
    @PostMapping("/register")
    public ResponseEntity<String> register(@Validated @RequestBody RegisterRequestDTO registerRequest) {
        String message = authService.registerPatient(registerRequest);
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    //Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Validated @RequestBody ForgotPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    //Xác thực OTP + Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Validated @RequestBody ResetPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}