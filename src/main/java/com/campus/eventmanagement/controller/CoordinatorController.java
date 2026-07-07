package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.entity.Coordinator;
import com.campus.eventmanagement.repository.CoordinatorRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/coordinators")
public class CoordinatorController {

    private final CoordinatorRepository coordinatorRepository;
    private final com.campus.eventmanagement.websocket.NotificationWebSocketHandler webSocketHandler;

    public CoordinatorController(CoordinatorRepository coordinatorRepository,
                                 com.campus.eventmanagement.websocket.NotificationWebSocketHandler webSocketHandler) {
        this.coordinatorRepository = coordinatorRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @PostConstruct
    public void seedDefaultCoordinators() {
        if (coordinatorRepository.count() == 0) {
            coordinatorRepository.save(Coordinator.builder()
                    .name("Dr. K. Srinivasa Rao")
                    .email("srinivas.k@college.edu")
                    .phone("9876543210")
                    .role("Symposium Convener")
                    .build());
            coordinatorRepository.save(Coordinator.builder()
                    .name("Prof. M. Chandrasekhar")
                    .email("chandra.m@college.edu")
                    .phone("8765432109")
                    .role("Co-Convener")
                    .build());
            coordinatorRepository.save(Coordinator.builder()
                    .name("Rahul Sharma")
                    .email("rahul.sharma@gmail.com")
                    .phone("7654321098")
                    .role("Student Lead Coordinator")
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

    private void triggerCoordinatorsUpdate() {
        try {
            webSocketHandler.broadcast("{\"type\":\"COORDINATORS_UPDATED\"}");
        } catch (Exception e) {
            // Ignore
        }
    }

    @GetMapping
    public List<Coordinator> getAllCoordinators() {
        return coordinatorRepository.findAll();
    }

    @PostMapping
    public Coordinator createCoordinator(@RequestBody Coordinator coordinator) {
        checkAdmin();
        Coordinator saved = coordinatorRepository.save(coordinator);
        triggerCoordinatorsUpdate();
        return saved;
    }

    @PutMapping("/{id}")
    public Coordinator updateCoordinator(@PathVariable Long id, @RequestBody Coordinator details) {
        checkAdmin();
        Coordinator c = coordinatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordinator not found!"));
        c.setName(details.getName());
        c.setEmail(details.getEmail());
        c.setPhone(details.getPhone());
        c.setRole(details.getRole());
        Coordinator updated = coordinatorRepository.save(c);
        triggerCoordinatorsUpdate();
        return updated;
    }

    @DeleteMapping("/{id}")
    public String deleteCoordinator(@PathVariable Long id) {
        checkAdmin();
        Coordinator c = coordinatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordinator not found!"));
        coordinatorRepository.delete(c);
        triggerCoordinatorsUpdate();
        return "Coordinator deleted successfully";
    }
}
