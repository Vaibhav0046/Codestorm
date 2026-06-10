package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import com.campus.eventmanagement.enums.EventType;
import java.time.LocalDate;

@Document(collection = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String name;

    private String description;

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

    private String timetablePdf;

    private String extraInfo;

    private String paymentQr;

    private String upiId;
}