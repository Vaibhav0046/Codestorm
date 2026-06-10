package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.RegistrationRequest;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.enums.RegistrationStatus;
import java.util.List;

public interface RegistrationService {
    Registration register(RegistrationRequest request, String userEmail);
    List<Registration> getMyRegistrations(String userEmail);
    List<Registration> getAllRegistrations();
    Registration updateStatus(Long registrationId, RegistrationStatus status);
    Registration getRegistrationById(Long id);
    Registration toggleCertificateApproval(Long id, boolean approved);
}
