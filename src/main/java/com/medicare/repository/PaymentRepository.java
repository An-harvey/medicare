package com.medicare.repository;

import com.medicare.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    // Dashboard: Tính tổng doanh thu trong một khoảng thời gian
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate >= :startDate AND p.paymentDate < :endDate")
    BigDecimal sumRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Dashboard: Lấy doanh thu theo từng tháng trong một năm
    @Query(value = "SELECT MONTH(p.payment_date) as month, SUM(p.amount) as revenue " +
                   "FROM Payments p WHERE YEAR(p.payment_date) = :year " +
                   "GROUP BY MONTH(p.payment_date)", nativeQuery = true)
    List<Object[]> findMonthlyRevenueByYear(@Param("year") int year);
}
