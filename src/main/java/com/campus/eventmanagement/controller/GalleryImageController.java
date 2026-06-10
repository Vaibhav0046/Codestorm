package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.GalleryImage;
import com.campus.eventmanagement.service.GalleryImageService;
import java.util.List;

@RestController
@RequestMapping("/api/gallery")
public class GalleryImageController {

    private final GalleryImageService galleryImageService;

    public GalleryImageController(GalleryImageService galleryImageService) {
        this.galleryImageService = galleryImageService;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<GalleryImage> getActiveImages() {
        return galleryImageService.getActiveImages();
    }

    @GetMapping("/all")
    public List<GalleryImage> getAllImages() {
        checkAdmin();
        return galleryImageService.getAllImages();
    }

    @GetMapping("/{id}")
    public GalleryImage getImageById(@PathVariable Long id) {
        return galleryImageService.getImageById(id);
    }

    @PostMapping
    public GalleryImage addImage(@RequestBody GalleryImage image) {
        checkAdmin();
        return galleryImageService.addImage(image);
    }

    @PutMapping("/{id}")
    public GalleryImage updateImage(@PathVariable Long id, @RequestBody GalleryImage image) {
        checkAdmin();
        return galleryImageService.updateImage(id, image);
    }

    @DeleteMapping("/{id}")
    public String deleteImage(@PathVariable Long id) {
        checkAdmin();
        galleryImageService.deleteImage(id);
        return "Image deleted successfully";
    }

    @PutMapping("/{id}/main-preview")
    public GalleryImage setMainPreview(@PathVariable Long id) {
        checkAdmin();
        return galleryImageService.setMainPreview(id);
    }
}
