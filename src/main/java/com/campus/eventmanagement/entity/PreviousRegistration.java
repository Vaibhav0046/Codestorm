package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "previous_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreviousRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventName;
    private String teamName;
    private String college;
    private String participantName;
    private String email;
    private String phone;
    private String tshirtSize;
    private String foodPreference;
    private String status;
    private LocalDateTime registrationDate;
    private String domain;
    private String theme;
}
