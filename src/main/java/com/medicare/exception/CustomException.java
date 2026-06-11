package com.medicare.exception;

import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException {

    private final HttpStatus status;

    // Khởi tạo mặc định với lỗi BAD_REQUEST (400) nếu không truyền status cụ thể
    public CustomException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    // Khởi tạo linh hoạt với mã HttpStatus mong muốn
    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}