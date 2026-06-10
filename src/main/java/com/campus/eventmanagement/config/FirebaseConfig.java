package com.campus.eventmanagement.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            File file = new File("firebase-service-account.json");
            if (file.exists()) {
                FileInputStream serviceAccount = new FileInputStream(file);
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                }
                System.out.println("Firebase Admin SDK initialized successfully.");
            } else {
                System.out.println("WARNING: firebase-service-account.json not found in the root directory. Backend Firebase authentication and FCM features will run in mock/fallback mode.");
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to initialize Firebase: " + e.getMessage());
        }
    }
}
