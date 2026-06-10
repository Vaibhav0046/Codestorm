package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "guests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    private Long id;

    private String name;

    private String photo;

    @Builder.Default
    private Integer priority = 1;

    @Builder.Default
    private boolean active = true;
}
