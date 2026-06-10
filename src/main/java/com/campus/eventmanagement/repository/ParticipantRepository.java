package com.campus.eventmanagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Participant;
import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.TShirtSize;

@Repository
public interface ParticipantRepository extends MongoRepository<Participant, Long> {
    long countByTshirtSize(TShirtSize tshirtSize);
    long countByFoodPreference(FoodPreference foodPreference);
}
