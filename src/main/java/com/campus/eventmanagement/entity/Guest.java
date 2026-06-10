package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String photo;

    @Builder.Default
    private Integer priority = 1;

    @Builder.Default
    private boolean active = true;
}
