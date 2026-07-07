package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.AuthResponse;
import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.SignupRequest;

public interface AuthService {
    void seedAdmin();

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    void sendOtp(String email);

    String getLatestOtpForEmail(String email);

    void sendForgotPasswordOtp(String email);

    void resetPassword(String email, String otp, String newPassword);
}