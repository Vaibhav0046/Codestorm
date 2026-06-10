package com.campus.eventmanagement.service;

import com.campus.eventmanagement.entity.Registration;
import java.io.ByteArrayInputStream;

public interface ReportService {
    byte[] generateRegistrationsCsv(java.util.List<Long> ids);
    byte[] generateRegistrationsPdf(java.util.List<Long> ids);
    byte[] generateCertificatePdf(Registration registration);
    byte[] generateGuidelinesPdf(String track);
}
