package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.service.EventService;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<Event> getActiveEvents() {
        return eventService.getActiveEvents();
    }

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        checkAdmin();
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        checkAdmin();
        return eventService.createEvent(event);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event event) {
        checkAdmin();
        return eventService.updateEvent(id, event);
    }

    @DeleteMapping("/{id}")
    public String deleteEvent(@PathVariable Long id) {
        checkAdmin();
        eventService.deleteEvent(id);
        return "Event deleted successfully";
    }
}
