package com.medicare.service.billing;

import com.medicare.dto.response.PaymentResponseDTO;
import java.util.List;

public interface PaymentService {
    // Admin xem toàn bộ danh sách các giao dịch dịch vụ y tế đã thực hiện hoàn tất
    List<PaymentResponseDTO> getAllPaidServices();
}