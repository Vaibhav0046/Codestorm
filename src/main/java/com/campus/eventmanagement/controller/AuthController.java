package com.campus.eventmanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import com.campus.eventmanagement.dto.AuthResponse;
import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.SignupRequest;
import com.campus.eventmanagement.service.AuthService;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RestClient restClient = RestClient.create();

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String resendFromEmail;

    public AuthController(AuthService authService) {
        this.authService = authService;
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

    // TEMPORARY diagnostic endpoint — remove after confirming mail works
    @GetMapping("/test-mail")
    public Map<String, String> testMail(@RequestParam String to) {
        Map<String, String> response = new HashMap<>();
        response.put("resend_api_key_set", (resendApiKey != null && !resendApiKey.isBlank()) ? "YES" : "NO");
        response.put("from_email", resendFromEmail);
        try {
            Map<String, Object> payload = Map.of(
                "from", "CodeStorm <" + resendFromEmail + ">",
                "to", List.of(to),
                "subject", "[CodeStorm] SMTP Test",
                "html", "<p>This is a test email from CodeStorm via Resend.</p>"
            );
            restClient.post()
                .uri("https://api.resend.com/emails")
                .header("Authorization", "Bearer " + resendApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
            response.put("status", "SUCCESS");
            response.put("message", "Test email sent to " + to);
        } catch (Exception e) {
            response.put("status", "FAILED");
            response.put("error_type", e.getClass().getName());
            response.put("error_message", e.getMessage());
        }
        return response;
    }
}
