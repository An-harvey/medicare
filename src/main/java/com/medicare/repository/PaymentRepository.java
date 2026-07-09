package com.medicare.repository;

import com.medicare.entity.Payment;
import com.medicare.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

    //Lấy thanh toán theo Id lịch hẹn
    Optional<Payment> findByAppointment_Id(UUID appointmentId);

    //Lấy danh sách lịch sử thanh toán của bệnh nhân( lọc status)
    @Query("SELECT p FROM Payment p WHERE p.appointment.patient.patientId = :patientId " +
            "AND (:status IS NULL OR p.status = :status)")
    Page<Payment> findByAppointment_Patient_PatientIdAndStatus(
            @Param("patientId") UUID patientId,
            @Param("status") PaymentStatus status,
            Pageable pageable);

    PaymentStatus status(PaymentStatus status);
}

