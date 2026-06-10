package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.*;
import com.campus.eventmanagement.enums.RegistrationStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    private Long id;

    @DocumentReference
    private User user;

    @DocumentReference
    private Event event;

    private String teamName;

    @Builder.Default
    private LocalDateTime registrationDate = LocalDateTime.now();

    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    private boolean certificateGenerated;

    private String certificateCode;

    private String labAllotment;

    private String paymentScreenshot;

    private String utrNumber;

    @DocumentReference
    @Builder.Default
    private List<Participant> participants = new ArrayList<>();
}
