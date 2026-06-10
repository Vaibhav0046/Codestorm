package com.campus.eventmanagement.entity;

import com.campus.eventmanagement.enums.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String teamName;

    private String college;

    private String phone;

    private Role role;

    private LocalDateTime createdAt = LocalDateTime.now();
}