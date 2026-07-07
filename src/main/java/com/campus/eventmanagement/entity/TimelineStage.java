package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timeline_stages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String step;
    private String title;
    private String status; // COMPLETED, ACTIVE, UPCOMING
    
    @Column(length = 500)
    private String description;

    private int displayOrder;
}
