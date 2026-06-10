package com.campus.eventmanagement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Event;

@Repository
public interface EventRepository extends MongoRepository<Event, Long> {
    List<Event> findByActiveTrue();
    Optional<Event> findByName(String name);
}
