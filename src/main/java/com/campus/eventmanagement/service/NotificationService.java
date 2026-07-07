package com.campus.eventmanagement.service;

import com.campus.eventmanagement.entity.Notification;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    Notification createNotification(String message, NotificationType type, User recipient);

    Notification broadcastNotification(String message, NotificationType type);

    List<Notification> getUserNotifications(String email);

    List<Notification> getAllNotifications();

    void deleteNotification(Long id);

    Notification updateNotification(Long id, String message, NotificationType type);
}