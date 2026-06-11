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

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.from.email:vaibhav3538reddy@gmail.com}")
    private String brevoFromEmail;

    @Value("${brevo.from.name:CodeStorm Event Management}")
    private String brevoFromName;

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
        response.put("brevo_api_key_set", (brevoApiKey != null && !brevoApiKey.isBlank()) ? "YES" : "NO");
        response.put("from_email", brevoFromEmail);
        try {
            Map<String, Object> sender = Map.of("name", brevoFromName, "email", brevoFromEmail);
            Map<String, Object> recipient = Map.of("email", to);
            Map<String, Object> payload = Map.of(
                "sender", sender,
                "to", List.of(recipient),
                "subject", "[CodeStorm] Test Email via Brevo",
                "htmlContent", "<p>This is a test email from CodeStorm via Brevo. If you received this, OTP emails will work!</p>"
            );
            restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey)
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
