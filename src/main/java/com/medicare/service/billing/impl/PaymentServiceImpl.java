package com.medicare.service.billing.impl;

import com.medicare.config.VNPayConfig;
import com.medicare.dto.response.PaymentResponseDTO;
import com.medicare.dto.response.PaymentUrlResponseDTO;
import com.medicare.entity.Appointment;
import com.medicare.entity.Payment;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.PaymentMethod;
import com.medicare.enums.PaymentStatus;
import com.medicare.exception.CustomException;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.PaymentRepository;
import com.medicare.service.billing.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final VNPayConfig vnPayConfig;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPaidServices() {
        List<Payment> payments = paymentRepository.findAll();

        return payments.stream()
                .map(p -> PaymentResponseDTO.builder()
                        .appointmentId(p.getAppointment().getId())
                        .patientName(p.getAppointment().getPatient().getUser().getFullName())
                        .doctorName(p.getAppointment().getDoctor().getUser().getFullName())
                        .transactionDate(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate() : null)
                        .serviceName("Phí Khám Chuyên Khoa: " + p.getAppointment().getDoctor().getSpecialty().getName())
                        .amount(p.getAmount())
                        .status(p.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void confirmCashPayment(UUID appointmentId) {
        Payment payment = paymentRepository.findByAppointment_Id(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin thanh toán.", HttpStatus.NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new CustomException("Hoá đơn này đã được thanh toán trước đó.", HttpStatus.BAD_REQUEST);
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setMethod(PaymentMethod.CASH);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        Appointment appointment = payment.getAppointment();
        if(appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            appointment.setStatus(AppointmentStatus.CHECK_IN);
            appointmentRepository.save(appointment);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentUrlResponseDTO createVnPayPaymentUrl(UUID appointmentId, HttpServletRequest request) {
        Payment payment = paymentRepository.findByAppointment_Id(appointmentId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin hóa đơn cần thanh toán.", HttpStatus.NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new CustomException("Hóa đơn này đã được thanh toán.", HttpStatus.BAD_REQUEST);
        }

        long amount = payment.getAmount().longValue() * 100;
        String vnp_TxnRef = payment.getId().toString(); // Sử dụng payment ID làm mã giao dịch

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.vnp_Version);
        vnp_Params.put("vnp_Command", vnPayConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan phi kham benh cho ma GD: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnPayConfig.getIpAddress(request));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime now = LocalDateTime.now();
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        try {
            for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                    hashData.append(entry.getKey()).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
                    hashData.append('&');
                    query.append('&');
                }
            }
        } catch (Exception e) {
            throw new CustomException("Lỗi khi tạo URL thanh toán VNPay", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Remove the last '&'
        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
        }
        if (query.length() > 0) {
            query.setLength(query.length() - 1);
        }

        String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
        String paymentUrl = vnPayConfig.vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;

        return PaymentUrlResponseDTO.builder()
                .paymentUrl(paymentUrl)
                .message("Tạo đường dẫn thanh toán thành công.")
                .build();
    }

    @Override
    @Transactional
    public String processVnPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signValue = vnPayConfig.hashAllFields(fields);

        if (signValue.equals(vnp_SecureHash)) {
            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
            String vnp_TxnRef = request.getParameter("vnp_TxnRef"); // Đây là Payment ID dạng String (UUID)

            if ("00".equals(vnp_ResponseCode)) {
                try {
                    // Chuyển đổi mã giao dịch vnp_TxnRef từ String về UUID
                    UUID paymentId = UUID.fromString(vnp_TxnRef);

                    //  Tìm kiếm hóa đơn trong Database
                    Payment payment = paymentRepository.findById(paymentId)
                            .orElseThrow(() -> new CustomException("Không tìm thấy thông tin hóa đơn trong hệ thống.", HttpStatus.NOT_FOUND));

                    //  Kiểm tra nếu hóa đơn chưa được cập nhật thì tiến hành cập nhật (Tránh ghi đè nếu IPN đã chạy trước)
                    if (payment.getStatus() != PaymentStatus.PAID) {

                        // Cập nhật thông tin Hóa đơn
                        payment.setStatus(PaymentStatus.PAID);
                        payment.setPaymentDate(LocalDateTime.now());
                        payment.setMethod(PaymentMethod.ONLINE); // Thiết lập phương thức thanh toán là Online
                        paymentRepository.save(payment);

                        // Cập nhật trạng thái Cuộc hẹn (Appointment) đi kèm sang CONFIRMED
                        Appointment appointment = payment.getAppointment();
                        if (appointment != null) {
                            appointment.setStatus(AppointmentStatus.CONFIRMED);
                            appointmentRepository.save(appointment);
                        }
                    }
                } catch (IllegalArgumentException e) {
                    throw new CustomException("Mã giao dịch VNPay trả về không hợp lệ.", HttpStatus.BAD_REQUEST);
                }

                return "Thanh toán thành công. Giao dịch: " + vnp_TxnRef + ". Hệ thống đã cập nhật trạng thái lịch hẹn của bạn.";
            } else {
                return "Thanh toán thất bại hoặc đã bị hủy. Mã lỗi: " + vnp_ResponseCode;
            }
        } else {
            return "Chữ ký không hợp lệ, giao dịch có thể đã bị giả mạo.";
        }
    }

    //Lấy danh sách lịch sử thanh toán bệnh nhân
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponseDTO> getPatientPaymentHistory(UUID patientId,PaymentStatus status, Pageable pageable) {
        // Lấy Page<Payment> từ Repository
        Page<Payment> paymentPage = paymentRepository.findByAppointment_Patient_PatientIdAndStatus(patientId, status, pageable);

        // Sử dụng map() của Page để chuyển đổi sang Page<PaymentResponseDTO>
        return paymentPage.map(p -> PaymentResponseDTO.builder()
                .appointmentId(p.getAppointment().getId())
                .patientName(p.getAppointment().getPatient().getUser().getFullName())
                .doctorName(p.getAppointment().getDoctor().getUser().getFullName())
                .transactionDate(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate() : null)
                .serviceName("Phí Khám Chuyên Khoa: " + p.getAppointment().getDoctor().getSpecialty().getName())
                .amount(p.getAmount())
                .status(p.getStatus().name()) // Trả về "PAID", "UNPAID", "REFUNDED", "CANCELLED"
                .build());
    }


    ///Khi nào tiến hành server thật
//    @Override
//    public String processVnPayReturn(HttpServletRequest request) {
//        Map<String, String> fields = new HashMap<>();
//        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
//            String fieldName = params.nextElement();
//            String fieldValue = request.getParameter(fieldName);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                fields.put(fieldName, fieldValue);
//            }
//        }
//
//        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
//        fields.remove("vnp_SecureHashType");
//        fields.remove("vnp_SecureHash");
//
//        String signValue = vnPayConfig.hashAllFields(fields);
//
//        if (signValue.equals(vnp_SecureHash)) {
//            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
//            String vnp_TxnRef = request.getParameter("vnp_TxnRef");
//
//            if ("00".equals(vnp_ResponseCode)) {
//                return "Thanh toán thành công. Giao dịch: " + vnp_TxnRef + ". Hệ thống đang cập nhật hóa đơn của bạn.";
//            } else {
//                return "Thanh toán thất bại hoặc đã bị hủy. Mã lỗi: " + vnp_ResponseCode;
//            }
//        } else {
//            return "Chữ ký không hợp lệ, giao dịch có thể đã bị giả mạo.";
//        }
//    }

//    //Xử lý IPN
//    @Override
//    @Transactional
//    public ResponseEntity<?> processVnPayIpn(HttpServletRequest request) {
//        Map<String, String> fields = new HashMap<>();
//        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
//            String fieldName = params.nextElement();
//            String fieldValue = request.getParameter(fieldName);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                fields.put(fieldName, fieldValue);
//            }
//        }
//
//        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
//        fields.remove("vnp_SecureHashType");
//        fields.remove("vnp_SecureHash");
//
//        String signValue = vnPayConfig.hashAllFields(fields);
//
//        if (!signValue.equals(vnp_SecureHash)) {
//            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
//        }
//
//        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
//        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
//        String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
//
//        try {
//            UUID paymentId = UUID.fromString(vnp_TxnRef);
//            Payment payment = paymentRepository.findById(paymentId).orElse(null);
//
//            if (payment == null) {
//                return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
//            }
//
//            long vnp_Amount = Long.parseLong(request.getParameter("vnp_Amount"));
//            if (vnp_Amount != payment.getAmount().longValue() * 100) {
//                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid amount"));
//            }
//
//            if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.REFUNDED) {
//                return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
//            }
//
//            // Logic cập nhật trạng thái khi giao dịch thành công (ResponseCode == 00)
//            if ("00".equals(vnp_ResponseCode)) {
//                Appointment appointment = payment.getAppointment();
//
//                if (appointment != null && appointment.getStatus() == AppointmentStatus.CANCELLED) {
//                    payment.setStatus(PaymentStatus.REFUNDED);
//                } else {
//                    payment.setStatus(PaymentStatus.PAID);
//                    if (appointment != null && appointment.getStatus() == AppointmentStatus.PENDING) {
//                        appointment.setStatus(AppointmentStatus.CONFIRMED);
//                        appointmentRepository.save(appointment);
//                    }
//                }
//                payment.setMethod(PaymentMethod.ONLINE);
//                payment.setTransactionNo(vnp_TransactionNo);
//                payment.setPaymentDate(LocalDateTime.now());
//                paymentRepository.save(payment);
//            }
//
//            // Trả về mã 00 báo cho VNPay biết server đã ghi nhận thành công
//            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
//
//        } catch (Exception e) {
//            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Unknown error"));
//        }
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public String checkPaymentStatus(UUID paymentId) {
//        Payment payment = paymentRepository.findById(paymentId)
//                .orElseThrow(() -> new CustomException("Không tìm thấy giao dịch", HttpStatus.NOT_FOUND));
//        return payment.getStatus().name(); // Trả về chuỗi: "UNPAID", "PAID", "REFUNDED",...
//    }


}
