package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.Notification;
import com.campus.eventmanagement.enums.NotificationType;
import com.campus.eventmanagement.service.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<Notification> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationService.getUserNotifications(email);
    }

    @PostMapping("/broadcast")
    public Notification broadcast(@RequestParam String message, @RequestParam NotificationType type) {
        checkAdmin();
        return notificationService.broadcastNotification(message, type);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        checkAdmin();
        notificationService.deleteNotification(id);
    }
}
