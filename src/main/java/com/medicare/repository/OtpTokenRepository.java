package com.medicare.repository;

import com.medicare.entity.OtpToken;
import com.medicare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {

    // Tìm mã OTP dựa trên Email của người dùng và mã OTP nhập vào
    Optional<OtpToken> findByUser_EmailAndOtp(String email, String otp);

    // Xóa các mã OTP cũ của người dùng (tránh spam hoặc trùng lặp)
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.user = :user")
    void deleteByUser(@Param("user") User user);
}