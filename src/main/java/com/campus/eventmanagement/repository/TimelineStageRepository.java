package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.TimelineStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineStageRepository extends JpaRepository<TimelineStage, Long> {

    List<TimelineStage> findAllByOrderByDisplayOrderAsc();
}
