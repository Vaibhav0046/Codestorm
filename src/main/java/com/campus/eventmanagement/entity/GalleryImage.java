package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "gallery_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private LocalDate uploadedDate;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean mainPreview = false;
}
