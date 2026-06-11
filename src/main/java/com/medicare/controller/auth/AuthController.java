package com.medicare.controller.auth;

import com.medicare.dto.request.LoginRequestDTO;
import com.medicare.dto.request.RegisterRequestDTO;
import com.medicare.dto.response.JwtResponseDTO;
import com.medicare.service.identity.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login : Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        JwtResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/register : Đăng ký tài khoản Patient mặc định
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDTO registerRequest) {
        String message = authService.registerPatient(registerRequest);
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }
}