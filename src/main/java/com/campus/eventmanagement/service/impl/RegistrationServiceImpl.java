package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.dto.RegistrationRequest;
import com.campus.eventmanagement.entity.*;
import com.campus.eventmanagement.enums.*;
import com.campus.eventmanagement.repository.*;
import com.campus.eventmanagement.service.NotificationService;
import com.campus.eventmanagement.service.RegistrationService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;
    private final NotificationService notificationService;

    public RegistrationServiceImpl(
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            ParticipantRepository participantRepository,
            NotificationService notificationService) {

        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Registration register(RegistrationRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.isActive()) {
            throw new RuntimeException("Event not active");
        }

        if (registrationRepository.existsByUserAndEvent(user, event)) {
            throw new RuntimeException("Already registered");
        }

        int size = (request.getParticipants() == null) ? 0 : request.getParticipants().size();

        if (size < event.getMinTeamSize() || size > event.getMaxTeamSize()) {
            throw new RuntimeException("Invalid team size");
        }

        Registration reg = new Registration();
        reg.setUser(user);
        reg.setEvent(event);
        reg.setTeamName(request.getTeamName() != null ? request.getTeamName() : user.getTeamName());
        reg.setRegistrationDate(LocalDateTime.now());
        reg.setStatus(RegistrationStatus.PENDING);

        // Build dynamic lab-batch combos based on the event configuration!
        String labsStr = event.getLabsConfig() != null && !event.getLabsConfig().trim().isEmpty() 
            ? event.getLabsConfig() 
            : "Lab 1, Lab 2, Lab 3";
        int maxBatches = event.getMaxBatchSize() != null && event.getMaxBatchSize() > 0 
            ? event.getMaxBatchSize() 
            : 5;

        String[] labsArray = labsStr.split(",");
        java.util.List<String> LAB_ALLOTMENTS = new java.util.ArrayList<>();
        for (String lab : labsArray) {
            String cleanLab = lab.trim();
            if (!cleanLab.isEmpty()) {
                for (int b = 1; b <= maxBatches; b++) {
                    LAB_ALLOTMENTS.add(cleanLab + " - Batch " + b);
                }
            }
        }
        
        if (LAB_ALLOTMENTS.isEmpty()) {
            LAB_ALLOTMENTS.add("Lab 1 - Batch 1");
        }

        List<Registration> allRegs = registrationRepository.findAll();
        java.util.Map<String, Long> allotmentCounts = new java.util.HashMap<>();
        for (String allotment : LAB_ALLOTMENTS) {
            allotmentCounts.put(allotment, 0L);
        }
        for (Registration r : allRegs) {
            if (r.getLabAllotment() != null && allotmentCounts.containsKey(r.getLabAllotment())) {
                allotmentCounts.put(r.getLabAllotment(), allotmentCounts.get(r.getLabAllotment()) + 1);
            }
        }
        String selectedAllotment = LAB_ALLOTMENTS.get(0);
        long minCount = Long.MAX_VALUE;
        for (String allotment : LAB_ALLOTMENTS) {
            long count = allotmentCounts.get(allotment);
            if (count < minCount) {
                minCount = count;
                selectedAllotment = allotment;
            }
        }
        reg.setLabAllotment(selectedAllotment);
        reg.setPaymentScreenshot(request.getPaymentScreenshot());
        reg.setUtrNumber(request.getUtrNumber());
        reg.setParticipants(new ArrayList<>());

        // Save initial registration to obtain ID
        Registration saved = registrationRepository.save(reg);

        List<Participant> savedParticipants = new ArrayList<>();
        if (request.getParticipants() != null) {
            for (var dto : request.getParticipants()) {
                Participant p = new Participant();
                p.setName(dto.getName());
                p.setEmail(dto.getEmail());
                p.setPhone(dto.getPhone());
                p.setTshirtSize(dto.getTshirtSize());
                p.setFoodPreference(dto.getFoodPreference());
                p.setCollege(dto.getCollege() != null ? dto.getCollege() : user.getCollege());
                p.setRegistration(saved);
                
                Participant savedParticipant = participantRepository.save(p);
                savedParticipants.add(savedParticipant);
            }
        }

        saved.setParticipants(savedParticipants);
        saved = registrationRepository.save(saved);

        notificationService.createNotification(
                "Registered for " + event.getName(),
                NotificationType.SUCCESS,
                user
        );

        notificationService.broadcastNotification(
                "New registration: " + event.getName(),
                NotificationType.INFO
        );

        return saved;
    }

    @Override
    public Registration updateStatus(Long id, RegistrationStatus status) {

        Registration reg = getRegistrationById(id);
        reg.setStatus(status);

        User user = reg.getUser();

        if (status == RegistrationStatus.APPROVED) {

            if (reg.getCertificateCode() == null) {
                reg.setCertificateCode(
                        UUID.randomUUID().toString().substring(0, 8).toUpperCase()
                );
            }

            notificationService.createNotification(
                    "Approved: " + reg.getEvent().getName(),
                    NotificationType.SUCCESS,
                    user
            );

        } else if (status == RegistrationStatus.REJECTED) {

            notificationService.createNotification(
                    "Rejected: " + reg.getEvent().getName(),
                    NotificationType.ALERT,
                    user
            );
        }

        return registrationRepository.save(reg);
    }

    @Override
    public Registration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    @Override
    public List<Registration> getMyRegistrations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return registrationRepository.findByUser(user);
    }

    @Override
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    @Override
    public Registration toggleCertificateApproval(Long id, boolean approved) {
        Registration reg = getRegistrationById(id);
        reg.setCertificateGenerated(approved);
        if (approved && reg.getCertificateCode() == null) {
            reg.setCertificateCode(
                java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase()
            );
        }
        return registrationRepository.save(reg);
    }
}