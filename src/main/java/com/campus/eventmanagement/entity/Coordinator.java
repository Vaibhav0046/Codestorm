package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coordinators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coordinator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String role; // Convener, Co-convener, Student Coordinator, Technical Head
}
