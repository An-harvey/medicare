package com.medicare.service.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("[Medicare] Yêu cầu đặt lại mật khẩu");

            // Tạo nội dung HTML cho email
            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>"
                    + "<h2>Xin chào,</h2>"
                    + "<p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Medicare của mình.</p>"
                    + "<p>Mã OTP xác thực của bạn là: <strong style='font-size: 24px; color: #007bff;'>" + otp + "</strong></p>"
                    + "<p>Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.</p>"
                    + "<p>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>"
                    + "<br>"
                    + "<p>Trân trọng,<br>Đội ngũ Medicare</p>"
                    + "</div>";

            helper.setText(htmlContent, true); // true = hỗ trợ HTML

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi hệ thống khi gửi email. Vui lòng thử lại sau.");
        }
    }
}