package com.campus.eventmanagement.service;

import com.campus.eventmanagement.entity.GalleryImage;
import java.util.List;

public interface GalleryImageService {
    List<GalleryImage> getAllImages();
    List<GalleryImage> getActiveImages();
    GalleryImage getImageById(Long id);
    GalleryImage addImage(GalleryImage image);
    GalleryImage updateImage(Long id, GalleryImage image);
    void deleteImage(Long id);
    GalleryImage setMainPreview(Long id);
    void seedMockImages();
}
