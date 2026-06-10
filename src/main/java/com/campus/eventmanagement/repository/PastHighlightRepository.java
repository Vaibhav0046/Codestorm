package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.PastHighlight;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastHighlightRepository extends MongoRepository<PastHighlight, Long> {
    List<PastHighlight> findByActiveTrue();
    List<PastHighlight> findByYearTitleAndActiveTrue(String yearTitle);
    List<PastHighlight> findByYearTitleAndFolderTypeAndTitle(String yearTitle, String folderType, String title);
}
