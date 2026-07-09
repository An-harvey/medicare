package com.medicare.config;

import com.medicare.exception.CustomException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Configuration
public class VNPayConfig {

    @Value("${vnpay.tmncode}")
    public String vnp_TmnCode;

    @Value("${vnpay.hashsecret}")
    public String secretKey;

    @Value("${vnpay.url}")
    public String vnp_PayUrl;

    @Value("${vnpay.returnurl}")
    public String vnp_ReturnUrl;

    public String vnp_Version = "2.1.0";
    public String vnp_Command = "pay";

    // Hàm tạo chữ ký bảo mật Hash (HMAC-SHA512)
    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
           throw new RuntimeException("Lỗi xảy ra trong quá trình băm HMAC-SHA512", ex );
        }
    }

    // Lấy IP của client (Bắt buộc đối với VNPay)
    public String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP";
        }
        return ipAdress;
    }

    //Hàm tạo chuỗi hash để xác thực dữ liệu từ VNPay trả về
    public String hashAllFields(Map<String, String> fields) {
        //  Lấy danh sách các key và sắp xếp theo thứ tự bảng chữ cái (A-Z)
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        //  Nối các field thành chuỗi dạng key=value&key2=value2
        StringBuilder sb = new StringBuilder();
        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    sb.append(fieldName);
                    sb.append("=");
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        sb.append("&");
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa dữ liệu đối soát VNPay", e);
        }

        //  Dùng hàm hmacSHA512 đã có sẵn ở trên để mã hóa chuỗi cùng với secretKey
        return hmacSHA512(secretKey, sb.toString());
    }
}