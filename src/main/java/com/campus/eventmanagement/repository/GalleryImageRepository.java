package com.campus.eventmanagement.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.GalleryImage;

@Repository
public interface GalleryImageRepository extends MongoRepository<GalleryImage, Long> {
    List<GalleryImage> findByActiveTrue();
}
