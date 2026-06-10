package com.campus.eventmanagement.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Notification;
import com.campus.eventmanagement.entity.User;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, Long> {
    
    @Query(value = "{ '$or': [ { 'recipient': null }, { 'recipient': ?0 } ] }", sort = "{ 'createdAt': -1 }")
    List<Notification> findByUserNotifications(User user);
    
    List<Notification> findByRecipientIsNullOrderByCreatedAtDesc();
}
