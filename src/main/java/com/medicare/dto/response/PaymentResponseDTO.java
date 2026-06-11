package com.medicare.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class PaymentResponseDTO {
    private UUID appointmentId;
    private String patientName;
    private String doctorName;
    private LocalDate transactionDate;
    private String serviceName; // Tên dịch vụ (Khám chuyên khoa)
    private Double amount;       // Số tiền mặc định giả định
    private String status;       // Trạng thái (ĐÃ THANH TOÁN)
}