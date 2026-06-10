package com.campus.eventmanagement.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campus.eventmanagement.dto.DashboardAnalyticsDto;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.RegistrationStatus;
import com.campus.eventmanagement.enums.TShirtSize;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.ParticipantRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;

    public AnalyticsController(
            RegistrationRepository registrationRepository,
            EventRepository eventRepository,
            ParticipantRepository participantRepository) {

        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping("/dashboard")
    public DashboardAnalyticsDto getDashboardAnalytics() {

        checkAdmin();

        long totalRegistrations = registrationRepository.count();
        long totalEvents = eventRepository.count();

        long vegCount =
                participantRepository.countByFoodPreference(FoodPreference.VEG);

        long nonVegCount =
                participantRepository.countByFoodPreference(FoodPreference.NON_VEG);

        long pendingApprovals =
                registrationRepository.findByStatus(RegistrationStatus.PENDING)
                        .size();

        Map<String, Long> tshirtCounts = new HashMap<>();

        for (TShirtSize size : TShirtSize.values()) {
            tshirtCounts.put(
                    size.name(),
                    participantRepository.countByTshirtSize(size)
            );
        }

        Map<String, Long> eventCounts = new HashMap<>();

        List<Event> events = eventRepository.findAll();

        for (Event event : events) {
            long count =
                    registrationRepository.findByEventId(event.getId()).size();

            eventCounts.put(event.getName(), count);
        }
        DashboardAnalyticsDto dto = new DashboardAnalyticsDto();

        dto.setTotalRegistrations(totalRegistrations);
        dto.setTotalEvents(totalEvents);
        dto.setVegCount(vegCount);
        dto.setNonVegCount(nonVegCount);
        dto.setPendingApprovals(pendingApprovals);
        dto.setTshirtSizeCounts(tshirtCounts);
        dto.setEventRegistrationCounts(eventCounts);

        return dto;
    }
}