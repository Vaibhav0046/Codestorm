package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "past_highlights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PastHighlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String yearTitle;

    private String folderType;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Builder.Default
    private boolean active = true;
}
