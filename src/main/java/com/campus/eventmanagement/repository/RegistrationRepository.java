package com.campus.eventmanagement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.enums.RegistrationStatus;

@Repository
public interface RegistrationRepository extends MongoRepository<Registration, Long> {
    List<Registration> findByUser(User user);
    
    @Query("{ 'event': ?0 }")
    List<Registration> findByEventId(Long eventId);
    
    List<Registration> findByStatus(RegistrationStatus status);
    Optional<Registration> findByCertificateCode(String certificateCode);
    boolean existsByUserAndEvent(User user, Event event);
}
