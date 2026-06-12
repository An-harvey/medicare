package com.medicare.service.identity.impl;

import com.medicare.dto.request.LoginRequestDTO;
import com.medicare.dto.request.RegisterRequestDTO;
import com.medicare.dto.response.JwtResponseDTO;
import com.medicare.entity.PatientProfile;
import com.medicare.entity.Role;
import com.medicare.entity.User;
import com.medicare.exception.CustomException;
import com.medicare.repository.PatientProfileRepository;
import com.medicare.repository.RoleRepository;
import com.medicare.repository.UserRepository;
import com.medicare.security.CustomUserDetails;
import com.medicare.security.JwtUtils;
import com.medicare.service.identity.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public JwtResponseDTO login(LoginRequestDTO request) {
        //  Sử dụng AuthenticationManager để Spring Security tự động kiểm tra mật khẩu
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        //  Lưu thông tin xác thực vào Context hệ thống
        SecurityContextHolder.getContext().setAuthentication(authentication);

        //  Trích xuất thông tin UserDetails đã được xác thực thành công
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        //  Sinh JWT Token từ thông tin User
        String jwt = jwtUtils.generateToken(userDetails);

        //  Lấy ra tên vai trò của User (bỏ tiền tố ROLE_ nếu có để trả về Client sạch dữ liệu)
        String roleName = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return JwtResponseDTO.builder()
                .token(jwt)
                .email(userDetails.getEmail())
                .role(roleName)
                .build();
    }

    @Override
    @Transactional // Đảm bảo đồng bộ tạo User và tạo Profile bệnh nhân, lỗi một trong hai sẽ rollback
    public String registerPatient(RegisterRequestDTO request) {
        // Kiểm tra các điều kiện duy nhất (Ràng buộc dữ liệu)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email này đã được sử dụng trên hệ thống.");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new CustomException("Số điện thoại này đã được đăng ký.");
        }
        if (userRepository.existsByCccd(request.getCccd())) {
            throw new CustomException("Số CCCD này đã tồn tại trên hệ thống.");
        }

        //  Lấy quyền mặc định là 'PATIENT' cho luồng tự đăng ký công khai
        Role patientRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new CustomException("Vai trò PATIENT không tồn tại trong hệ thống danh mục."));

        // Khởi tạo cấu trúc tài khoản User mới
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword())) // Bắt buộc mã hóa BCrypt
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .cccd(request.getCccd())
                .role(patientRole)
                .isActive(true)
                .build();

        // Lưu User trước để có ID định danh (UUID)
        User savedUser = userRepository.save(user);

        //  Tạo đồng thời Hồ sơ bệnh nhân rỗng liên kết trực tiếp (Shared Primary Key)
        PatientProfile patientProfile = PatientProfile.builder()
                .user(savedUser) // Map cấu trúc quan hệ OneToOne nghịch đảo
                .build();

        patientProfileRepository.save(patientProfile);

        return "Đăng ký tài khoản bệnh nhân thành công.";
    }
}