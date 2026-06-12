package com.campus.eventmanagement.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final Cloudinary cloudinary;

    public FileUploadController(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        checkAdmin();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // Upload to Cloudinary without invalid transformation parameters to avoid errors
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder",        "codestorm",
                "resource_type", "image"
            )
        );

        String secureUrl = (String) uploadResult.get("secure_url");
        System.out.println("Uploaded to Cloudinary: " + secureUrl);

        return ResponseEntity.ok(Map.of("url", secureUrl));
    }
}
