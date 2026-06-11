package com.medicare.controller.public_api;

import com.medicare.utils.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName, HttpServletRequest request) {
        // Gọi Service lấy file từ ổ cứng lên
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Xác định loại file (MIME type) để trình duyệt biết đó là ảnh
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("Không thể xác định kiểu file.");
        }

        // Nếu không xác định được, set mặc định là binary stream
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Trả file về cho Frontend
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}