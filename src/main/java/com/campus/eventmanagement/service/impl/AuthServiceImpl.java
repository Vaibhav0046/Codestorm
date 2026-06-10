package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.dto.AuthResponse;
import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.SignupRequest;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.entity.OtpVerification;
import com.campus.eventmanagement.enums.Role;
import com.campus.eventmanagement.repository.UserRepository;
import com.campus.eventmanagement.repository.OtpVerificationRepository;
import com.campus.eventmanagement.service.AuthService;
import com.campus.eventmanagement.util.JwtTokenProvider;

import jakarta.annotation.PostConstruct;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpVerificationRepository otpVerificationRepository;
    private final JavaMailSender mailSender;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           OtpVerificationRepository otpVerificationRepository,
                           JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.otpVerificationRepository = otpVerificationRepository;
        this.mailSender = mailSender;
    }

    @PostConstruct
    @Override
    public void seedAdmin() {
        if (!userRepository.existsByEmail("admin@campus.com")) {
            User admin = new User();
            admin.setEmail("admin@campus.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setTeamName("System Admin");
            admin.setCollege("Campus Admin HQ");
            admin.setPhone("1234567890");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
        }
    }

    @Override
    public void sendOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required!");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered!");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        OtpVerification verification = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpVerificationRepository.save(verification);

        System.out.println("==================================================");
        System.out.println("OTP Verification Code for " + email + ": " + otp);
        System.out.println("==================================================");

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("CodeStorm Signup OTP Verification");
                message.setText("Your verification code is: " + otp + "\nThis code will expire in 5 minutes.");
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required!");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required!");
        }
        if (request.getTeamName() == null || request.getTeamName().trim().isEmpty()) {
            throw new RuntimeException("Team name is required!");
        }
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            throw new RuntimeException("Verification code (OTP) is required!");
        }

        // Validate password complexity
        String password = request.getPassword();
        if (password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long!");
        }
        boolean hasUppercase = false;
        boolean hasLowercase = false;
        boolean hasNumber = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUppercase = true;
            if (Character.isLowerCase(c)) hasLowercase = true;
            if (Character.isDigit(c)) hasNumber = true;
        }
        if (!hasUppercase || !hasLowercase || !hasNumber) {
            throw new RuntimeException("Password must contain at least one uppercase letter, one lowercase letter, and one number!");
        }

        // Verify OTP code
        OtpVerification verification = otpVerificationRepository.findById(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No OTP requested for this email!"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired!");
        }

        if (!verification.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP code!");
        }

        otpVerificationRepository.delete(verification);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTeamName(request.getTeamName());
        user.setCollege(request.getCollege() != null ? request.getCollege() : "Not Specified");
        user.setPhone(request.getPhone() != null ? request.getPhone() : "Not Specified");
        user.setRole(Role.ROLE_USER);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        String token = tokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getTeamName(),
                user.getRole().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.findByTeamName(request.getEmail())
                        .orElseThrow(() -> new RuntimeException(
                                "User not found with email or team name: "
                                        + request.getEmail())));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        String token = tokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getTeamName(),
                user.getRole().name()
        );
    }

    @Override
    public String getLatestOtpForEmail(String email) {
        return otpVerificationRepository.findById(email)
                .map(OtpVerification::getOtp)
                .orElse(null);
    }
}