package com.campus.eventmanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.dto.AuthResponse;
import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.SignupRequest;
import com.campus.eventmanagement.service.AuthService;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:not-set}")
    private String mailUsername;

    public AuthController(AuthService authService, JavaMailSender mailSender) {
        this.authService = authService;
        this.mailSender = mailSender;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestParam String email) {
        authService.sendOtp(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully!");
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return response;
    }

    // TEMPORARY diagnostic endpoint — remove after fixing mail issue
    @GetMapping("/test-mail")
    public Map<String, String> testMail(@RequestParam String to) {
        Map<String, String> response = new HashMap<>();
        response.put("configured_sender", mailUsername);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(mailUsername);
            helper.setTo(to);
            helper.setSubject("[CodeStorm] SMTP Test");
            helper.setText("<p>This is a test email from CodeStorm to verify SMTP is working.</p>", true);
            mailSender.send(mimeMessage);
            response.put("status", "SUCCESS");
            response.put("message", "Test email sent to " + to);
        } catch (Exception e) {
            response.put("status", "FAILED");
            response.put("error_type", e.getClass().getName());
            response.put("error_message", e.getMessage());
            response.put("cause", e.getCause() != null ? e.getCause().getMessage() : "null");
            response.put("root_cause", (e.getCause() != null && e.getCause().getCause() != null)
                    ? e.getCause().getCause().getMessage() : "null");
        }
        return response;
    }
}
