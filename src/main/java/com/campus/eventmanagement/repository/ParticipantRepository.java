package com.campus.eventmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.campus.eventmanagement.entity.Participant;
import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.TShirtSize;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    long countByTshirtSize(TShirtSize tshirtSize);
    long countByFoodPreference(FoodPreference foodPreference);
}
