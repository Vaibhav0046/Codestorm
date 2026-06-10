package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDate;

@Document(collection = "gallery_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImage {

    @Id
    private Long id;

    private String title;

    private String imageUrl;

    private LocalDate uploadedDate;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean mainPreview = false;
}
