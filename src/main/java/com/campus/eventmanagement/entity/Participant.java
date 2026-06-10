package com.campus.eventmanagement.entity;

import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.TShirtSize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Document(collection = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "registration")
public class Participant {

    @Id
    private Long id;

    @DocumentReference(lazy = true)
    @JsonIgnore
    private Registration registration;

    private String name;

    private String email;

    private String phone;

    private TShirtSize tshirtSize;

    private FoodPreference foodPreference;

    private String college;
}
