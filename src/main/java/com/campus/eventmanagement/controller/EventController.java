package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.entity.PreviousRegistration;
import com.campus.eventmanagement.repository.PreviousRegistrationRepository;
import com.campus.eventmanagement.service.EventService;
import com.campus.eventmanagement.service.ReportService;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final PreviousRegistrationRepository previousRegistrationRepository;
    private final ReportService reportService;

    public EventController(EventService eventService,
                           PreviousRegistrationRepository previousRegistrationRepository,
                           ReportService reportService) {
        this.eventService = eventService;
        this.previousRegistrationRepository = previousRegistrationRepository;
        this.reportService = reportService;
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

    @GetMapping("/previous-registrations")
    public List<PreviousRegistration> getPreviousRegistrations(@RequestParam String eventName) {
        checkAdmin();
        return previousRegistrationRepository.findByEventNameOrderByRegistrationDateDesc(eventName);
    }

    @GetMapping("/previous-registrations/names")
    public List<String> getPreviousRegistrationNames() {
        checkAdmin();
        return previousRegistrationRepository.findDistinctEventNames();
    }

    @GetMapping("/previous-registrations/report/excel")
    public ResponseEntity<byte[]> downloadPreviousRegistrationsExcel(@RequestParam String eventName) {
        checkAdmin();
        List<PreviousRegistration> list = previousRegistrationRepository.findByEventNameOrderByRegistrationDateDesc(eventName);
        byte[] data = reportService.generatePreviousRegistrationsCsv(list);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "previous_registrations_" + eventName.replace(" ", "_") + ".csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @GetMapping("/previous-registrations/report/pdf")
    public ResponseEntity<byte[]> downloadPreviousRegistrationsPdf(@RequestParam String eventName) {
        checkAdmin();
        List<PreviousRegistration> list = previousRegistrationRepository.findByEventNameOrderByRegistrationDateDesc(eventName);
        byte[] data = reportService.generatePreviousRegistrationsPdf(list);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "previous_registrations_" + eventName.replace(" ", "_") + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return ResponseEntity.ok().headers(headers).body(data);
    }
}
