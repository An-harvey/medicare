package com.medicare.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    // Lấy đường dẫn thư mục cấu hình từ application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path fileStorageLocation;

    // Hàm này chạy ngay khi khởi tạo Service để tạo thư mục nếu chưa có
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo thư mục lưu trữ file.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        //  Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new RuntimeException("File tải lên trống.");
        }

        //  Validate định dạng ảnh (Chỉ cho phép jpg, jpeg, png)
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList("image/jpeg", "image/png", "image/jpg");
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new RuntimeException("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG.");
        }

        //  Chuẩn hóa tên file và tạo UUID để chống trùng lặp tên file
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ hoặc bị trống");
        }
        String cleanFileName = StringUtils.cleanPath(originalFileName);
        String extension = StringUtils.getFilenameExtension(cleanFileName);
        String newFileName = UUID.randomUUID() + (extension != null ? "." + extension : "");

        try {
            //  Copy file vào thư mục đích (thay thế nếu trùng - dù xác suất trùng UUID là rất thấp)
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu file " + newFileName + ". Xin vui lòng thử lại!", ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Không tìm thấy file hoặc file không thể đọc: " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Không tìm thấy file: " + fileName, ex);
        }
    }
}