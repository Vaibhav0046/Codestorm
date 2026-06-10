package com.campus.eventmanagement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.enums.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUser(User user);
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByStatus(RegistrationStatus status);
    Optional<Registration> findByCertificateCode(String certificateCode);
    boolean existsByUserAndEvent(User user, Event event);
}
