package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @GetMapping
    public User getProfile() {
        User user = userRepository.findByEmail(getAuthenticatedUserEmail())
                .orElseThrow(() -> new RuntimeException("Profile not found!"));
        user.setPassword(null); // Clear password from response for safety
        return user;
    }

    @PutMapping
    public User updateProfile(@RequestBody User userDetails) {
        User user = userRepository.findByEmail(getAuthenticatedUserEmail())
                .orElseThrow(() -> new RuntimeException("Profile not found!"));
        
        user.setTeamName(userDetails.getTeamName());
        user.setCollege(userDetails.getCollege());
        user.setPhone(userDetails.getPhone());
        
        // If they provided a new password, encode it and update
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); // Clear password from response for safety
        return savedUser;
    }

    @PutMapping("/fcm-token")
    public String updateFcmToken(@RequestBody java.util.Map<String, String> payload) {
        String token = payload.get("token");
        User user = userRepository.findByEmail(getAuthenticatedUserEmail())
                .orElseThrow(() -> new RuntimeException("Profile not found!"));
        user.setFcmToken(token);
        userRepository.save(user);
        return "FCM Token updated successfully";
    }
}
