package com.medicare.service.billing;

import com.medicare.dto.response.PaymentResponseDTO;
import com.medicare.dto.response.PaymentUrlResponseDTO;
import com.medicare.enums.PaymentStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface PaymentService {
    // Admin xem toàn bộ danh sách các giao dịch dịch vụ y tế đã thực hiện hoàn tất
    List<PaymentResponseDTO> getAllPaidServices();

    //Staff cập nhật thanh toán cho patient
    public void confirmCashPayment(UUID appointmentId);

    // Thêm hàm tạo URL VNPay
    PaymentUrlResponseDTO createVnPayPaymentUrl(UUID appointmentId, HttpServletRequest request);

    //Xử lý callBack
    String processVnPayReturn(HttpServletRequest request);

//    // Xử lý IPN từ VNPay
//    ResponseEntity<?> processVnPayIpn(HttpServletRequest request);
//
//    //Hàm check trạng thái Payment
//    String checkPaymentStatus(UUID paymentId);

    //Lấy danh sách lịch sử thanh toán của bệnh nhân
    Page<PaymentResponseDTO> getPatientPaymentHistory(UUID patientId, PaymentStatus status, Pageable pageable);
}