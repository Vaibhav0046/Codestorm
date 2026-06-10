package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.RegistrationRequest;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.enums.RegistrationStatus;
import com.campus.eventmanagement.service.RegistrationService;
import com.campus.eventmanagement.service.ReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final ReportService reportService;

    public RegistrationController(
            RegistrationService registrationService,
            ReportService reportService) {
        this.registrationService = registrationService;
        this.reportService = reportService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException(
                    "Access Denied: Admin authorization required!");
        }
    }

    @PostMapping
    public Registration register(@RequestBody RegistrationRequest request) {
        return registrationService.register(
                request,
                getAuthenticatedUserEmail());
    }

    @GetMapping("/my")
    public List<Registration> getMyRegistrations() {
        return registrationService.getMyRegistrations(
                getAuthenticatedUserEmail());
    }

    @GetMapping
    public List<Registration> getAllRegistrations() {
        checkAdmin();
        return registrationService.getAllRegistrations();
    }

    @PutMapping("/{id}/status")
    public Registration updateStatus(
            @PathVariable Long id,
            @RequestParam RegistrationStatus status) {

        checkAdmin();
        return registrationService.updateStatus(id, status);
    }

    private List<Long> parseIds(String ids) {
        if (ids == null || ids.trim().isEmpty()) {
            return null;
        }
        java.util.List<Long> list = new java.util.ArrayList<>();
        String[] idArray = ids.split(",");
        for (String idStr : idArray) {
            try {
                list.add(Long.parseLong(idStr.trim()));
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        return list;
    }

    @GetMapping("/report/excel")
    public ResponseEntity<byte[]> downloadExcelReport(
            @RequestParam(required = false) String ids) {

        checkAdmin();

        List<Long> idList = parseIds(ids);
        byte[] csvData = reportService.generateRegistrationsCsv(idList);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=registrations_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> downloadPdfReport(
            @RequestParam(required = false) String ids) {

        checkAdmin();

        List<Long> idList = parseIds(ids);
        byte[] pdfData = reportService.generateRegistrationsPdf(idList);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=registrations_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }

    @GetMapping("/report/guidelines")
    public ResponseEntity<byte[]> downloadGuidelinesReport(
            @RequestParam String track) {

        byte[] pdfData = reportService.generateGuidelinesPdf(track);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=guidelines_" + track.replaceAll("\\s+", "_") + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }

    @PutMapping("/{id}/approve-certificate")
    public Registration toggleCertificateApproval(
            @PathVariable Long id,
            @RequestParam boolean approved) {

        checkAdmin();
        return registrationService.toggleCertificateApproval(id, approved);
    }

    @PutMapping("/approve-certificates")
    public ResponseEntity<String> approveMultipleCertificates(
            @RequestParam String ids,
            @RequestParam boolean approved) {

        checkAdmin();
        List<Long> idList = parseIds(ids);
        if (idList != null) {
            for (Long id : idList) {
                registrationService.toggleCertificateApproval(id, approved);
            }
        }
        return ResponseEntity.ok("Certificates updated successfully!");
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long id) {

        Registration reg =
                registrationService.getRegistrationById(id);

        byte[] pdfData =
                reportService.generateCertificatePdf(reg);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=certificate_" +
                                reg.getId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }
}