package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import com.campus.eventmanagement.enums.EventType;
import java.time.LocalDate;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType type;

    private Integer minTeamSize;

    private Integer maxTeamSize;

    private LocalDate date;

    private String venue;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private String labsConfig = "Lab 1, Lab 2, Lab 3";

    @Builder.Default
    private Integer maxBatchSize = 5;

    @Column(columnDefinition = "TEXT")
    private String timetablePdf;

    @Column(columnDefinition = "TEXT")
    private String extraInfo;

    @Column(columnDefinition = "TEXT")
    private String paymentQr;

    private String upiId;

    private String helpDeskDetails;

    private String domains;
    private String themes;
}