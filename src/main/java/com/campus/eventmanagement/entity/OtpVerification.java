package com.campus.eventmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @Column(name = "email", nullable = false)
    private String email;

    private String otp;

    private LocalDateTime expiresAt;
}
