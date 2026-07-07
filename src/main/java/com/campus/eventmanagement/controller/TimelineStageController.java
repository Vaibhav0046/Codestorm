package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.entity.TimelineStage;
import com.campus.eventmanagement.repository.TimelineStageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timeline-stages")
public class TimelineStageController {

    private final TimelineStageRepository timelineStageRepository;

    public TimelineStageController(TimelineStageRepository timelineStageRepository) {
        this.timelineStageRepository = timelineStageRepository;
    }

    @PostConstruct
    public void seedDefaultStages() {
        if (timelineStageRepository.count() == 0) {
            timelineStageRepository.save(TimelineStage.builder()
                    .step("01")
                    .title("Idea Registration")
                    .status("COMPLETED")
                    .description("Form squads of 2-4 and select target theme problems.")
                    .displayOrder(1)
                    .build());
            timelineStageRepository.save(TimelineStage.builder()
                    .step("02")
                    .title("Internal Screening")
                    .status("COMPLETED")
                    .description("Submit short abstract PPTs for college jury assessment.")
                    .displayOrder(2)
                    .build());
            timelineStageRepository.save(TimelineStage.builder()
                    .step("03")
                    .title("Finalist Nominations")
                    .status("ACTIVE")
                    .description("Shortlisted final teams selected for the National Portal.")
                    .displayOrder(3)
                    .build());
            timelineStageRepository.save(TimelineStage.builder()
                    .step("04")
                    .title("Grand 36H Finale")
                    .status("UPCOMING")
                    .description("Non-stop code development and live evaluation rounds.")
                    .displayOrder(4)
                    .build());
        }
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<TimelineStage> getAllStages() {
        return timelineStageRepository.findAllByOrderByDisplayOrderAsc();
    }

    @PostMapping
    public TimelineStage createStage(@RequestBody TimelineStage stage) {
        checkAdmin();
        return timelineStageRepository.save(stage);
    }

    @PutMapping("/{id}")
    public TimelineStage updateStage(@PathVariable Long id, @RequestBody TimelineStage stageDetails) {
        checkAdmin();
        TimelineStage stage = timelineStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stage not found!"));
        stage.setStep(stageDetails.getStep());
        stage.setTitle(stageDetails.getTitle());
        stage.setStatus(stageDetails.getStatus());
        stage.setDescription(stageDetails.getDescription());
        stage.setDisplayOrder(stageDetails.getDisplayOrder());
        return timelineStageRepository.save(stage);
    }

    @DeleteMapping("/{id}")
    public String deleteStage(@PathVariable Long id) {
        checkAdmin();
        TimelineStage stage = timelineStageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stage not found!"));
        timelineStageRepository.delete(stage);
        return "Timeline stage deleted successfully";
    }
}
