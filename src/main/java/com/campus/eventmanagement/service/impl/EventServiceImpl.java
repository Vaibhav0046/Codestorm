package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.enums.EventType;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;
import com.campus.eventmanagement.repository.PreviousRegistrationRepository;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.entity.Participant;
import com.campus.eventmanagement.entity.PreviousRegistration;
import com.campus.eventmanagement.service.EventService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PreviousRegistrationRepository previousRegistrationRepository;

    public EventServiceImpl(EventRepository eventRepository,
                            RegistrationRepository registrationRepository,
                            PreviousRegistrationRepository previousRegistrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.previousRegistrationRepository = previousRegistrationRepository;
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
            event1.setDomains("AI & ML, Cybersecurity, IoT & Embedded, Blockchain");
            event1.setHelpDeskDetails("Coordinator: Dr. A. Prasad (9848012345)");
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
            event3.setDomains("Web/App Dev, Hardware Prototype, Cloud & DevOps, AR/VR");
            event3.setHelpDeskDetails("Coordinator: Prof. S. Ramesh (9848054321)");
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
            event4.setDomains("Fintech, Edtech, Agritech, Healthcare & Assistive");
            event4.setHelpDeskDetails("Coordinator: Dr. V. Srinivas (9988776655)");
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
        
        // If inactivating the event, remove all its registrations
        if (!eventDetails.isActive() && event.isActive()) {
            List<Registration> regs = registrationRepository.findByEventId(id);
            registrationRepository.deleteAll(regs);
        }

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
        event.setHelpDeskDetails(eventDetails.getHelpDeskDetails());
        event.setDomains(eventDetails.getDomains());
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        List<Registration> regs = registrationRepository.findByEventId(id);
        for (Registration r : regs) {
            if (r.getParticipants() == null || r.getParticipants().isEmpty()) {
                PreviousRegistration prev = PreviousRegistration.builder()
                        .eventName(event.getName())
                        .teamName(r.getTeamName())
                        .college(r.getUser() != null ? r.getUser().getCollege() : "")
                        .participantName(r.getTeamName())
                        .email(r.getUser() != null ? r.getUser().getEmail() : "")
                        .phone(r.getUser() != null ? r.getUser().getPhone() : "")
                        .tshirtSize("L")
                        .foodPreference("VEG")
                        .status(r.getStatus().name())
                        .registrationDate(r.getRegistrationDate())
                        .domain(r.getDomain())
                        .theme(r.getTheme())
                        .build();
                previousRegistrationRepository.save(prev);
            } else {
                for (Participant p : r.getParticipants()) {
                    PreviousRegistration prev = PreviousRegistration.builder()
                            .eventName(event.getName())
                            .teamName(r.getTeamName())
                            .college(p.getCollege())
                            .participantName(p.getName())
                            .email(p.getEmail())
                            .phone(p.getPhone())
                            .tshirtSize(p.getTshirtSize() != null ? p.getTshirtSize().name() : "L")
                            .foodPreference(p.getFoodPreference() != null ? p.getFoodPreference().name() : "VEG")
                            .status(r.getStatus().name())
                            .registrationDate(r.getRegistrationDate())
                            .domain(r.getDomain())
                            .theme(r.getTheme())
                            .build();
                    previousRegistrationRepository.save(prev);
                }
            }
        }
        registrationRepository.deleteAll(regs);
        eventRepository.delete(event);
    }
}
