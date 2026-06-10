package com.campus.eventmanagement.controller;

import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.dto.AuthResponse;
import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.SignupRequest;
import com.campus.eventmanagement.service.AuthService;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

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
}
