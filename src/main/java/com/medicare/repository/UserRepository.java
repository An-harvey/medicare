package com.medicare.repository;

import com.medicare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Phục vụ đăng nhập và kiểm tra tồn tại
    Optional<User> findByEmail(String email);

    // Phục vụ nhân viên tra cứu bệnh nhân
    Optional<User> findByCccd(String cccd);

    // Kiểm tra trùng lặp lúc đăng ký
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByCccd(String cccd);

    //Lấy danh sách user
    @Query("SELECT u FROM User u WHERE " +
            "(:roleId IS NULL OR u.role.id = :roleId) AND " +
            "(:keyword IS NULL OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "u.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "u.cccd LIKE CONCAT('%', :keyword, '%'))")
    Page<User> findAllUsersWithFilter(@Param("keyword") String keyword,
                                      @Param("roleId") Integer roleId,
                                      Pageable pageable);

    // Dashboard: Đếm số user được tạo trước một thời điểm
    long countByCreatedAtBefore(LocalDateTime time);
}
