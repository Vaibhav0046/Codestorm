package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.PreviousRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PreviousRegistrationRepository extends JpaRepository<PreviousRegistration, Long> {

    List<PreviousRegistration> findByEventNameOrderByRegistrationDateDesc(String eventName);

    List<PreviousRegistration> findByEventNameAndStatusOrderByRegistrationDateDesc(String eventName, String status);

    @Query("SELECT DISTINCT p.eventName FROM PreviousRegistration p")
    List<String> findDistinctEventNames();
}
