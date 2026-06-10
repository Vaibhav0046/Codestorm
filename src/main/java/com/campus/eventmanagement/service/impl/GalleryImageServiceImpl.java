package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.entity.GalleryImage;
import com.campus.eventmanagement.repository.GalleryImageRepository;
import com.campus.eventmanagement.service.GalleryImageService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class GalleryImageServiceImpl implements GalleryImageService {

    private final GalleryImageRepository galleryImageRepository;

    public GalleryImageServiceImpl(GalleryImageRepository galleryImageRepository) {
        this.galleryImageRepository = galleryImageRepository;
    }

    @PostConstruct
    @Override
    public void seedMockImages() {
        if (galleryImageRepository.count() == 0) {
            // Seed 4 stunning, high-resolution, relevant hackathon images from Unsplash
            GalleryImage img1 = GalleryImage.builder()
                    .title("NRCM Grand Finale - Developer Collaboration")
                    .imageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80")
                    .uploadedDate(LocalDate.now())
                    .active(true)
                    .mainPreview(true)
                    .build();

            GalleryImage img2 = GalleryImage.builder()
                    .title("Interactive Mentorship & Coding Sessions")
                    .imageUrl("https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80")
                    .uploadedDate(LocalDate.now())
                    .active(true)
                    .mainPreview(true)
                    .build();

            GalleryImage img3 = GalleryImage.builder()
                    .title("Idea Pitching & Jury Presentations")
                    .imageUrl("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80")
                    .uploadedDate(LocalDate.now())
                    .active(true)
                    .mainPreview(true)
                    .build();

            GalleryImage img4 = GalleryImage.builder()
                    .title("Prototypes & Building IoT Innovations")
                    .imageUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80")
                    .uploadedDate(LocalDate.now())
                    .active(true)
                    .mainPreview(true)
                    .build();

            galleryImageRepository.save(img1);
            galleryImageRepository.save(img2);
            galleryImageRepository.save(img3);
            galleryImageRepository.save(img4);
        }
    }

    @Override
    public List<GalleryImage> getAllImages() {
        return galleryImageRepository.findAll();
    }

    @Override
    public List<GalleryImage> getActiveImages() {
        return galleryImageRepository.findByActiveTrue();
    }

    @Override
    public GalleryImage getImageById(Long id) {
        return galleryImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));
    }

    @Override
    public GalleryImage addImage(GalleryImage image) {
        if (image.getUploadedDate() == null) {
            image.setUploadedDate(LocalDate.now());
        }
        return galleryImageRepository.save(image);
    }

    @Override
    public GalleryImage updateImage(Long id, GalleryImage imageDetails) {
        GalleryImage image = getImageById(id);
        image.setTitle(imageDetails.getTitle());
        image.setImageUrl(imageDetails.getImageUrl());
        image.setActive(imageDetails.isActive());
        return galleryImageRepository.save(image);
    }

    @Override
    public void deleteImage(Long id) {
        GalleryImage image = getImageById(id);
        galleryImageRepository.delete(image);
    }

    @org.springframework.transaction.annotation.Transactional
    @Override
    public GalleryImage setMainPreview(Long id) {
        GalleryImage image = getImageById(id);
        List<GalleryImage> folderImages = galleryImageRepository.findAll();
        for (GalleryImage gi : folderImages) {
            if (gi.getTitle() != null && gi.getTitle().equalsIgnoreCase(image.getTitle())) {
                gi.setMainPreview(gi.getId().equals(id));
                galleryImageRepository.save(gi);
            }
        }
        return image;
    }
}
