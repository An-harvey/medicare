package com.medicare.exception;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp; // Thời gian xảy ra lỗi
    private int status;              // Mã HTTP Status (VD: 400, 404, 500)
    private String error;            // Tên lỗi ngắn gọn (VD: Bad Request)
    private String message;          // Thông báo chi tiết cho người dùng
    private String path;             // Endpoint xảy ra lỗi
}