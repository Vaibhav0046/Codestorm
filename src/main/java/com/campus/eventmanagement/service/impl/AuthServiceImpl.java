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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpVerificationRepository otpVerificationRepository;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String resendFromEmail;

    private final RestClient restClient = RestClient.create();

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           OtpVerificationRepository otpVerificationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.otpVerificationRepository = otpVerificationRepository;
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

        // Upsert: delete any existing OTP for this email first to avoid duplicate key issues
        otpVerificationRepository.findById(email).ifPresent(otpVerificationRepository::delete);

        OtpVerification verification = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpVerificationRepository.save(verification);

        System.out.println("==========================================");
        System.out.println("OTP for " + email + ": " + otp);
        System.out.println("==========================================");

        try {
            if (resendApiKey == null || resendApiKey.isBlank()) {
                throw new RuntimeException("RESEND_API_KEY environment variable is not configured!");
            }

            Map<String, Object> payload = Map.of(
                "from", "CodeStorm <" + resendFromEmail + ">",
                "to", List.of(email),
                "subject", "[CodeStorm] Your Registration OTP Verification Code",
                "html", buildOtpEmailHtml(email, otp)
            );

            restClient.post()
                .uri("https://api.resend.com/emails")
                .header("Authorization", "Bearer " + resendApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

            System.out.println("OTP email sent successfully via Resend to: " + email);
        } catch (Exception e) {
            System.err.println("==== OTP EMAIL SEND FAILURE ====");
            System.err.println("To: " + email);
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Caused by: " + e.getCause().getMessage());
            }
            System.err.println("================================");
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String email, String otp) {
        return "<!DOCTYPE html>\n" +
               "<html lang='en'>\n" +
               "<head>\n" +
               "  <meta charset='UTF-8'>\n" +
               "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
               "  <title>CodeStorm OTP Verification</title>\n" +
               "</head>\n" +
               "<body style='margin:0;padding:0;font-family:Segoe UI,Arial,sans-serif;background:#0f172a;'>\n" +
               "  <table width='100%' cellpadding='0' cellspacing='0' style='background:#0f172a;padding:40px 0;'>\n" +
               "    <tr><td align='center'>\n" +
               "      <table width='560' cellpadding='0' cellspacing='0' style='background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);'>\n" +
               "        <!-- Header -->\n" +
               "        <tr><td style='background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;'>\n" +
               "          <h1 style='color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;'>\uD83C\uDF29\uFE0F CodeStorm</h1>\n" +
               "          <p style='color:#c4b5fd;margin:8px 0 0;font-size:14px;'>Campus Event Management Platform</p>\n" +
               "        </td></tr>\n" +
               "        <!-- Body -->\n" +
               "        <tr><td style='padding:40px;'>\n" +
               "          <h2 style='color:#f1f5f9;margin:0 0 12px;font-size:20px;'>Verify Your Registration</h2>\n" +
               "          <p style='color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;'>\n" +
               "            You're one step away from joining CodeStorm! Use the verification code below to complete your account registration at <strong style='color:#a5b4fc;'>" + email + "</strong>.\n" +
               "          </p>\n" +
               "          <!-- OTP Box -->\n" +
               "          <div style='background:#0f172a;border:2px solid #6366f1;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;'>\n" +
               "            <p style='color:#94a3b8;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;'>Your Verification Code</p>\n" +
               "            <p style='color:#ffffff;font-size:42px;font-weight:700;letter-spacing:12px;margin:0;font-family:monospace;'>" + otp + "</p>\n" +
               "            <p style='color:#64748b;font-size:12px;margin:16px 0 0;'>\u23F1\uFE0F Expires in <strong style='color:#f59e0b;'>5 minutes</strong></p>\n" +
               "          </div>\n" +
               "          <!-- Steps -->\n" +
               "          <p style='color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 8px;'>\uD83D\uDCCB <strong style='color:#e2e8f0;'>How to use:</strong></p>\n" +
               "          <ol style='color:#94a3b8;font-size:14px;line-height:2;margin:0 0 28px;padding-left:20px;'>\n" +
               "            <li>Return to the CodeStorm signup page.</li>\n" +
               "            <li>Enter the 6-digit code above in the OTP field.</li>\n" +
               "            <li>Complete your profile and start exploring events!</li>\n" +
               "          </ol>\n" +
               "          <!-- Security notice -->\n" +
               "          <div style='background:#1e3a5f;border-left:4px solid #3b82f6;border-radius:4px;padding:14px 18px;'>\n" +
               "            <p style='color:#93c5fd;font-size:13px;margin:0;'>\uD83D\uDD12 <strong>Security Notice:</strong> If you did not request this code, please ignore this email. Do not share this OTP with anyone.</p>\n" +
               "          </div>\n" +
               "        </td></tr>\n" +
               "        <!-- Footer -->\n" +
               "        <tr><td style='background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;'>\n" +
               "          <p style='color:#475569;font-size:12px;margin:0;'>This email was sent to " + email + " because a registration was initiated on CodeStorm.</p>\n" +
               "          <p style='color:#334155;font-size:11px;margin:8px 0 0;'>\u00A9 2025 CodeStorm · Campus Event Management</p>\n" +
               "        </td></tr>\n" +
               "      </table>\n" +
               "    </td></tr>\n" +
               "  </table>\n" +
               "</body>\n" +
               "</html>";
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
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email or team name is required!");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required!");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseGet(() -> userRepository.findByTeamName(request.getEmail().trim())
                        .orElseThrow(() -> new RuntimeException(
                                "No account found with that email or team name. Please sign up first.")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
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