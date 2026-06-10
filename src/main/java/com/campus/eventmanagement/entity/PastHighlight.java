package com.campus.eventmanagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "past_highlights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PastHighlight {

    @Id
    private Long id;

    private String yearTitle;

    private String folderType;

    private String title;

    private String description;

    private String imageUrl;

    @Builder.Default
    private boolean active = true;
}
