package com.campus.eventmanagement.entity;

import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.TShirtSize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "registration")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    @JsonIgnore
    private Registration registration;

    private String name;

    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private TShirtSize tshirtSize;

    @Enumerated(EnumType.STRING)
    private FoodPreference foodPreference;

    private String college;
}
