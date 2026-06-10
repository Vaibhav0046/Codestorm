package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.enums.EventType;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.service.EventService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @PostConstruct
    @Override
    public void seedMockEvents() {

        if (eventRepository.count() == 0) {

            Event event1 = new Event();
            event1.setName("PPT Presentation");
            event1.setDescription("Showcase your technical and communication skills with a research paper or engineering presentation in front of industry judges.");
            event1.setType(EventType.TEAM);
            event1.setMinTeamSize(1);
            event1.setMaxTeamSize(3);
            event1.setDate(LocalDate.now().plusDays(10));
            event1.setVenue("Main Auditorium");
            event1.setActive(true);
            event1.setUpiId("7569059847@ybl");
            eventRepository.save(event1);

            Event event2 = new Event();
            event2.setName("Ignite");
            event2.setDescription("The ultimate lightning talk! 5 minutes, 20 slides, auto-advancing. Test your quick thinking and presentation pacing on futuristic tech themes.");
            event2.setType(EventType.INDIVIDUAL);
            event2.setMinTeamSize(1);
            event2.setMaxTeamSize(1);
            event2.setDate(LocalDate.now().plusDays(11));
            event2.setVenue("Seminar Hall B");
            event2.setActive(true);
            event2.setUpiId("7569059847@ybl");
            eventRepository.save(event2);

            Event event3 = new Event();
            event3.setName("Project Expo");
            event3.setDescription("Deploy, demonstrate, and pitch your working hardware or software models to technical auditors and VC mentors.");
            event3.setType(EventType.TEAM);
            event3.setMinTeamSize(2);
            event3.setMaxTeamSize(4);
            event3.setDate(LocalDate.now().plusDays(12));
            event3.setVenue("Innovation Hall");
            event3.setActive(true);
            event3.setUpiId("7569059847@ybl");
            eventRepository.save(event3);

            Event event4 = new Event();
            event4.setName("CodeStorm Hackathon");
            event4.setDescription("A high-stakes 24-hour sprint. Form a squad to design and develop production-grade solutions resolving real-world problems.");
            event4.setType(EventType.TEAM);
            event4.setMinTeamSize(2);
            event4.setMaxTeamSize(4);
            event4.setDate(LocalDate.now().plusDays(13));
            event4.setVenue("E-Learning Lab");
            event4.setActive(true);
            event4.setUpiId("7569059847@ybl");
            eventRepository.save(event4);

            Event event5 = new Event();
            event5.setName("Tech Internship Drive");
            event5.setDescription("A competitive screening hack and interview drive by premier corporate sponsors offering immediate industrial placements.");
            event5.setType(EventType.INDIVIDUAL);
            event5.setMinTeamSize(1);
            event5.setMaxTeamSize(1);
            event5.setDate(LocalDate.now().plusDays(14));
            event5.setVenue("Placement Cell");
            event5.setActive(true);
            event5.setUpiId("7569059847@ybl");
            eventRepository.save(event5);
        }
    }
    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getActiveEvents() {
        return eventRepository.findByActiveTrue();
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    @Override
    public Event createEvent(Event event) {
        if (eventRepository.findByName(event.getName()).isPresent()) {
            throw new RuntimeException("Event name already exists!");
        }
        return eventRepository.save(event);
    }

    @Override
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setType(eventDetails.getType());
        event.setMinTeamSize(eventDetails.getMinTeamSize());
        event.setMaxTeamSize(eventDetails.getMaxTeamSize());
        event.setDate(eventDetails.getDate());
        event.setVenue(eventDetails.getVenue());
        event.setActive(eventDetails.isActive());
        event.setLabsConfig(eventDetails.getLabsConfig());
        event.setMaxBatchSize(eventDetails.getMaxBatchSize());
        event.setTimetablePdf(eventDetails.getTimetablePdf());
        event.setExtraInfo(eventDetails.getExtraInfo());
        event.setPaymentQr(eventDetails.getPaymentQr());
        event.setUpiId(eventDetails.getUpiId());
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
    }
}
