package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.Guest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GuestRepository extends MongoRepository<Guest, Long> {
    List<Guest> findByActiveTrueOrderByPriorityAsc();
}
