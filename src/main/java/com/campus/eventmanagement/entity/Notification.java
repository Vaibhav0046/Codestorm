package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.*;
import com.campus.eventmanagement.enums.NotificationType;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private Long id;

    private String message;

    private NotificationType type;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @DocumentReference
    private User recipient;
}
