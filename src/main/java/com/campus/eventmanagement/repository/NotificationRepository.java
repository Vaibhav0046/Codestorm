package com.campus.eventmanagement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Notification;
import com.campus.eventmanagement.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipient IS NULL OR n.recipient = :user ORDER BY n.createdAt DESC")
    List<Notification> findByUserNotifications(User user);

    List<Notification> findByRecipientIsNullOrderByCreatedAtDesc();
}
