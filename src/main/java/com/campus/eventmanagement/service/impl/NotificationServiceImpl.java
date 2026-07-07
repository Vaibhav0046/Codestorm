package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.entity.Notification;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.enums.NotificationType;
import com.campus.eventmanagement.repository.NotificationRepository;
import com.campus.eventmanagement.repository.UserRepository;
import com.campus.eventmanagement.service.NotificationService;
import com.campus.eventmanagement.websocket.NotificationWebSocketHandler;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationWebSocketHandler webSocketHandler;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   NotificationWebSocketHandler webSocketHandler) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @Override
    public List<Notification> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        List<Notification> list = new java.util.ArrayList<>(notificationRepository.findByUserNotifications(user));
        if (user.getRole() != com.campus.eventmanagement.enums.Role.ROLE_ADMIN) {
            list.removeIf(n -> n.getRecipient() == null && n.getMessage() != null && n.getMessage().startsWith("New registration:"));
        }
        return list;
    }

    @Override
    public Notification createNotification(String message,
                                           NotificationType type,
                                           User recipient) {

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipient(recipient);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        pushWsNotification(saved);
        return saved;
    }

    @Override
    public Notification broadcastNotification(String message,
                                              NotificationType type) {

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipient(null);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        pushWsNotification(saved);
        return saved;
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findByRecipientIsNullOrderByCreatedAtDesc();
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public Notification updateNotification(Long id, String message, NotificationType type) {
        Notification note = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        note.setMessage(message);
        note.setType(type);
        Notification saved = notificationRepository.save(note);
        pushWsNotification(saved);
        return saved;
    }

    private void pushWsNotification(Notification note) {
        String json = String.format(
                "{\"id\":%d,\"message\":\"%s\",\"type\":\"%s\",\"createdAt\":\"%s\",\"recipientEmail\":\"%s\"}",
                note.getId(),
                note.getMessage().replace("\"", "\\\""),
                note.getType().name(),
                note.getCreatedAt().toString(),
                note.getRecipient() != null ? note.getRecipient().getEmail() : "ALL"
        );
        webSocketHandler.broadcast(json);
    }
}
