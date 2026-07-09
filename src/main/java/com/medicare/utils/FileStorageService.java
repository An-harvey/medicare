package com.medicare.utils;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    // Hàm lưu file và trả về tên file đã được mã hoá
    String storeFile(MultipartFile file);

    // Hàm đọc file từ ổ cứng lên để hiển thị
    Resource loadFileAsResource(String fileName);
}