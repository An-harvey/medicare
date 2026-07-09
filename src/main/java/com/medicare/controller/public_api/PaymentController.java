package com.medicare.controller.public_api;

import com.medicare.dto.response.PaymentUrlResponseDTO;
import com.medicare.service.billing.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/create-vnpay/{appointmentId}")
    public ResponseEntity<PaymentUrlResponseDTO> createPaymentLink(
            @PathVariable UUID appointmentId, HttpServletRequest request) {
        PaymentUrlResponseDTO response = paymentService.createVnPayPaymentUrl(appointmentId, request);
        return ResponseEntity.ok(response);
    }

    //API trả từ VNPay về web
    @GetMapping("/vnpay-return")
    public RedirectView vnPayReturn(HttpServletRequest request) {
        String result = paymentService.processVnPayReturn(request);
        String baseUrl = "http://localhost:5173/dashboard/payments";

        if (result.startsWith("SUCCESS:")) {
            String paymentId = result.substring(8);
            // Gắn paymentId vào URL để Frontend biết mà lấy ra gọi API check status
            return new RedirectView(baseUrl + "?status=success&paymentId=" + paymentId);
        } else if (result.startsWith("FAILED:")) {
            String msg = URLEncoder.encode(result.substring(7), StandardCharsets.UTF_8);
            return new RedirectView(baseUrl + "?status=failed&message=" + msg);
        } else {
            String msg = URLEncoder.encode(result.substring(8), StandardCharsets.UTF_8);
            return new RedirectView(baseUrl + "?status=invalid&message=" + msg);
        }
    }

//    //API nhận kết quả từ VNPay
//    @GetMapping("/vnpay-ipn")
//    public ResponseEntity<?> vnPayIpn(HttpServletRequest request) {
//        return paymentService.processVnPayIpn(request);
//    }
//
//    // API phục vụ cho Frontend Polling
//    @GetMapping("/check-status/{paymentId}")
//    public ResponseEntity<String> checkStatus(@PathVariable UUID paymentId) {
//        return ResponseEntity.ok(paymentService.checkPaymentStatus(paymentId));
//    }
}
