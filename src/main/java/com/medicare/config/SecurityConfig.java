package com.medicare.config;

import com.medicare.security.CustomUserDetailsService;
import com.medicare.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Kích hoạt @PreAuthorize nếu cần phân quyền nhỏ lẻ ở method
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Mã hóa mật khẩu lưu trong DB bằng BCrypt
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                //BẬT CORS CHO SPRING SECURITY (ĐỂ CHO PHÉP REQUEST OPTIONS ĐI QUA)
                .cors(Customizer.withDefaults())
                //  Tắt CSRF bảo vệ (do REST API sử dụng Token)
                .csrf(AbstractHttpConfigurer::disable)

                //  Cấu hình Session thành vô trạng thái (Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                //  Phân quyền Endpoint dựa trên Danh sách REST API Endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập không cần token
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        // Thả xích các URL của Swagger UI để dev test API công khai
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Các dải API giới hạn theo vai trò (Bỏ prefix ROLE_ vì hasRole tự động thêm)
                        .requestMatchers("/api/patient/**").hasRole("PATIENT")
                        .requestMatchers("/api/staff/**").hasRole("STAFF")
                        .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Mọi request còn lại phải xác thực
                        .anyRequest().authenticated()
                );

        // Nạp Provider quản lý User và Pass
        http.authenticationProvider(authenticationProvider());

        // Đẩy bộ lọc JwtAuthFilter lên trước bộ lọc mặc định của Spring Security
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}