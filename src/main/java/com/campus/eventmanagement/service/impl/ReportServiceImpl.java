package com.campus.eventmanagement.service.impl;

import com.campus.eventmanagement.entity.Participant;
import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.repository.RegistrationRepository;
import com.campus.eventmanagement.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final RegistrationRepository registrationRepository;

    public ReportServiceImpl(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @Override
    public byte[] generateRegistrationsCsv(List<Long> ids) {
        List<Registration> registrations;
        if (ids == null || ids.isEmpty()) {
            registrations = registrationRepository.findAll();
        } else {
            java.util.Map<Long, Registration> regMap = registrationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Registration::getId, java.util.function.Function.identity()));
            registrations = ids.stream()
                .filter(regMap::containsKey)
                .map(regMap::get)
                .collect(Collectors.toList());
        }

        StringBuilder csv = new StringBuilder();
        
        // CSV Header
        csv.append("Registration ID,Event Name,Domain,Registered Account,Team Name,Registration Date,Status,Certificate Code,Participant Name,Participant Email,Phone,T-Shirt Size,Food Preference,College,Lab Allotment\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Registration r : registrations) {
            // Save only the approved team details, not the rejected/pending members
            if (r.getStatus() != com.campus.eventmanagement.enums.RegistrationStatus.APPROVED) {
                continue;
            }
            
            String base = String.format("%d,%s,%s,%s,%s,%s,%s,%s",
                    r.getId(),
                    escapeCsv(r.getEvent().getName()),
                    escapeCsv(r.getDomain() != null ? r.getDomain() : "N/A"),
                    escapeCsv(r.getUser().getEmail()),
                    escapeCsv(r.getTeamName()),
                    r.getRegistrationDate().format(dtf),
                    r.getStatus().name(),
                    r.getCertificateCode() != null ? r.getCertificateCode() : "N/A"
            );

            if (r.getParticipants() == null || r.getParticipants().isEmpty()) {
                csv.append(base).append(String.format(",,,,,,,%s\n", escapeCsv(r.getLabAllotment())));
            } else {
                for (Participant p : r.getParticipants()) {
                    csv.append(base).append(String.format(",%s,%s,%s,%s,%s,%s,%s\n",
                            escapeCsv(p.getName()),
                            escapeCsv(p.getEmail()),
                            escapeCsv(p.getPhone()),
                            p.getTshirtSize().name(),
                            p.getFoodPreference().name(),
                            escapeCsv(p.getCollege()),
                            escapeCsv(r.getLabAllotment())
                    ));
                }
            }
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] generateRegistrationsPdf(List<Long> ids) {
        List<Registration> registrations;
        if (ids == null || ids.isEmpty()) {
            registrations = registrationRepository.findAll();
        } else {
            java.util.Map<Long, Registration> regMap = registrationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Registration::getId, java.util.function.Function.identity()));
            registrations = ids.stream()
                .filter(regMap::containsKey)
                .map(regMap::get)
                .collect(Collectors.toList());
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Landscape A4 document layout to fit 10 detailed columns beautifully
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 40, 20);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(26, 54, 93));
        Paragraph title = new Paragraph("Campus Event & Hackathon Registrations Ledger Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        // Subtitle
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY);
        Paragraph subtitle = new Paragraph("Generated on: " + java.time.LocalDateTime.now().toString() + " | Entries count: " + registrations.size(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(15);
        document.add(subtitle);

        // 10 Detailed Columns Table
        PdfPTable table = new PdfPTable(10);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.6f, 1.8f, 1.8f, 1.8f, 2.2f, 1.6f, 0.8f, 0.8f, 2.0f, 1.0f});

        // Headers
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        String[] headers = {"ID", "Team Name", "Event Name", "Participant", "Email", "Phone", "T-Shirt", "Food", "Lab Allotment", "Status"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
            cell.setBackgroundColor(new Color(26, 54, 93)); // Premium Navy
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Data Rows
        Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);

        for (Registration r : registrations) {
            String idStr = String.valueOf(r.getId());
            String teamStr = r.getTeamName();
            String eventStr = r.getEvent().getName();
            String statusStr = r.getStatus().name();
            String labStr = r.getLabAllotment() != null ? r.getLabAllotment() : "N/A";

            if (r.getParticipants() == null || r.getParticipants().isEmpty()) {
                table.addCell(createCell(idStr, dataFont, Element.ALIGN_CENTER));
                table.addCell(createCell(teamStr, dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell(eventStr, dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell("N/A", dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell(r.getUser().getEmail(), dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell("N/A", dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell("N/A", dataFont, Element.ALIGN_CENTER));
                table.addCell(createCell("N/A", dataFont, Element.ALIGN_CENTER));
                table.addCell(createCell(labStr, dataFont, Element.ALIGN_LEFT));
                table.addCell(createCell(statusStr, dataFont, Element.ALIGN_CENTER));
            } else {
                for (Participant p : r.getParticipants()) {
                    table.addCell(createCell(idStr, dataFont, Element.ALIGN_CENTER));
                    table.addCell(createCell(teamStr, dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(eventStr, dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(p.getName(), dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(p.getEmail(), dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(p.getPhone(), dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(p.getTshirtSize() != null ? p.getTshirtSize().name() : "N/A", dataFont, Element.ALIGN_CENTER));
                    table.addCell(createCell(p.getFoodPreference() != null ? p.getFoodPreference().name() : "N/A", dataFont, Element.ALIGN_CENTER));
                    table.addCell(createCell(labStr, dataFont, Element.ALIGN_LEFT));
                    table.addCell(createCell(statusStr, dataFont, Element.ALIGN_CENTER));
                }
            }
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    @Override
    public byte[] generateCertificatePdf(Registration registration) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        
        if (registration.isCertificateGenerated()) {
            // Landscape certificate
            Document document = new Document(PageSize.A4.rotate(), 54, 54, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Draw a double line decorative border around the page
            PdfContentByte cb = writer.getDirectContent();
            cb.setLineWidth(3f);
            cb.setColorStroke(new Color(212, 175, 55)); // Gold border
            cb.rectangle(30, 30, PageSize.A4.rotate().getWidth() - 60, PageSize.A4.rotate().getHeight() - 60);
            cb.stroke();

            cb.setLineWidth(1f);
            cb.setColorStroke(new Color(26, 54, 93)); // Navy border
            cb.rectangle(35, 35, PageSize.A4.rotate().getWidth() - 70, PageSize.A4.rotate().getHeight() - 70);
            cb.stroke();

            // Certificate Header
            Paragraph space = new Paragraph(" ");
            space.setSpacingAfter(20);
            document.add(space);

            Font hostFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, new Color(26, 54, 93));
            Paragraph host = new Paragraph("CAMPUS TECHNICAL SYMPOSIUM", hostFont);
            host.setAlignment(Element.ALIGN_CENTER);
            document.add(host);

            Font certLabelFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new Color(212, 175, 55));
            Paragraph certLabel = new Paragraph("CERTIFICATE OF EXCELLENCE & ACHIEVEMENT", certLabelFont);
            certLabel.setAlignment(Element.ALIGN_CENTER);
            certLabel.setSpacingBefore(10);
            certLabel.setSpacingAfter(30);
            document.add(certLabel);

            Font bodyFont = FontFactory.getFont(FontFactory.TIMES, 16, Color.BLACK);
            Paragraph body1 = new Paragraph("This is to certify that team / participant", bodyFont);
            body1.setAlignment(Element.ALIGN_CENTER);
            document.add(body1);

            // Team Name in Big Bold letters
            Font teamFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(43, 108, 176));
            Paragraph team = new Paragraph(registration.getTeamName(), teamFont);
            team.setAlignment(Element.ALIGN_CENTER);
            team.setSpacingBefore(10);
            team.setSpacingAfter(10);
            document.add(team);

            // Participants list
            String pList = registration.getParticipants().stream()
                    .map(Participant::getName)
                    .collect(Collectors.joining(", "));
            Font pFont = FontFactory.getFont(FontFactory.HELVETICA, 13, Color.DARK_GRAY);
            Paragraph participants = new Paragraph("Members: " + pList, pFont);
            participants.setAlignment(Element.ALIGN_CENTER);
            participants.setSpacingAfter(20);
            document.add(participants);

            Paragraph body2 = new Paragraph("has successfully completed the symposium challenge event with high honors:", bodyFont);
            body2.setAlignment(Element.ALIGN_CENTER);
            document.add(body2);

            // Event name
            Font eventFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(26, 54, 93));
            Paragraph eventName = new Paragraph(registration.getEvent().getName(), eventFont);
            eventName.setAlignment(Element.ALIGN_CENTER);
            eventName.setSpacingBefore(10);
            eventName.setSpacingAfter(10);
            document.add(eventName);

            // Lab allotment
            Font labValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(212, 175, 55));
            Paragraph labPara = new Paragraph("ALLOTTED VENUE & BATCH: " + (registration.getLabAllotment() != null ? registration.getLabAllotment().toUpperCase() : "N/A"), labValFont);
            labPara.setAlignment(Element.ALIGN_CENTER);
            labPara.setSpacingAfter(20);
            document.add(labPara);

            // Footer details
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            Font footerValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font footerLblFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);

            // We use a small table for the signatures and verification code
            PdfPTable footerTable = new PdfPTable(3);
            footerTable.setWidthPercentage(100);
            
            PdfPCell c1 = new PdfPCell();
            c1.setBorder(Rectangle.NO_BORDER);
            c1.addElement(new Paragraph("Date: " + registration.getRegistrationDate().format(dtf), footerValFont));
            c1.addElement(new Paragraph("REGISTRATION DATE", footerLblFont));
            footerTable.addCell(c1);

            PdfPCell c2 = new PdfPCell();
            c2.setBorder(Rectangle.NO_BORDER);
            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
            c2.addElement(new Paragraph("Verification: #" + (registration.getCertificateCode() != null ? registration.getCertificateCode() : "N/A"), footerValFont));
            c2.addElement(new Paragraph("SECURE AUTH CODE", footerLblFont));
            footerTable.addCell(c2);

            PdfPCell c3 = new PdfPCell();
            c3.setBorder(Rectangle.NO_BORDER);
            c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
            c3.addElement(new Paragraph("Convener Signature", footerValFont));
            c3.addElement(new Paragraph("CAMPUS TECHNICAL BOARD", footerLblFont));
            footerTable.addCell(c3);

            document.add(space);
            document.add(footerTable);

            document.close();
        } else {
            // Generate vertical portrait Admit Pass matching the UI card preview
            Document document = new Document(PageSize.A4, 54, 54, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            float width = PageSize.A4.getWidth();
            float height = PageSize.A4.getHeight();

            PdfContentByte cb = writer.getDirectContent();
            
            // Gold border
            cb.setLineWidth(3f);
            cb.setColorStroke(new Color(212, 175, 55)); // Gold Color
            cb.rectangle(30, 30, width - 60, height - 60);
            cb.stroke();

            // Navy border
            cb.setLineWidth(1f);
            cb.setColorStroke(new Color(26, 54, 93)); // Navy Color
            cb.rectangle(35, 35, width - 70, height - 70);
            cb.stroke();

            // Header info
            Paragraph space = new Paragraph(" ");
            space.setSpacingAfter(15);
            document.add(space);

            Font tagFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(212, 175, 55));
            Paragraph tag = new Paragraph("NRCM SYMPOSIUM ADMIT PASS", tagFont);
            tag.setAlignment(Element.ALIGN_CENTER);
            document.add(tag);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(26, 54, 93));
            Paragraph title = new Paragraph(registration.getEvent().getName().toUpperCase(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(5);
            title.setSpacingAfter(20);
            document.add(title);

            // A nice line separator
            Paragraph separatorLine = new Paragraph("--------------------------------------------------------------------------------------------------", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.LIGHT_GRAY));
            separatorLine.setAlignment(Element.ALIGN_CENTER);
            separatorLine.setSpacingAfter(20);
            document.add(separatorLine);

            // Card grid table
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(90);
            detailsTable.setWidths(new float[]{1f, 1f});

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.GRAY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);

            // Row 1
            detailsTable.addCell(createGridCell("SQUAD NAME", labelFont, registration.getTeamName(), valueFont));
            detailsTable.addCell(createGridCell("COLLEGE", labelFont, registration.getUser().getCollege() != null ? registration.getUser().getCollege() : "Institution", valueFont));

            // Row 2
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            detailsTable.addCell(createGridCell("DATE & TIME", labelFont, registration.getEvent().getDate().format(dateFormatter), valueFont));
            detailsTable.addCell(createGridCell("NODAL CENTER", labelFont, registration.getEvent().getVenue(), valueFont));

            document.add(detailsTable);

            // Space
            Paragraph smallSpace = new Paragraph(" ");
            smallSpace.setSpacingAfter(25);
            document.add(smallSpace);

            // Allotted Lab & Batch Shaded Box
            if (registration.getLabAllotment() != null) {
                PdfPTable labBoxTable = new PdfPTable(1);
                labBoxTable.setWidthPercentage(90);
                
                PdfPCell labCell = new PdfPCell();
                labCell.setBackgroundColor(new Color(248, 250, 252)); // slate-50/100
                labCell.setBorderColor(new Color(226, 232, 240)); // border
                labCell.setBorderWidth(1f);
                labCell.setPadding(15);
                
                Font labTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(212, 175, 55));
                Paragraph labTitle = new Paragraph("ALLOTTED LAB & BATCH", labTitleFont);
                labTitle.setAlignment(Element.ALIGN_CENTER);
                labCell.addElement(labTitle);
                
                Font labValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(26, 54, 93));
                Paragraph labVal = new Paragraph(registration.getLabAllotment().toUpperCase(), labValFont);
                labVal.setAlignment(Element.ALIGN_CENTER);
                labVal.setSpacingBefore(5);
                labCell.addElement(labVal);
                
                labBoxTable.addCell(labCell);
                document.add(labBoxTable);
            }

            // Perforation Line at y = 250
            cb.setLineWidth(1.5f);
            cb.setColorStroke(new Color(160, 174, 192)); // Slate Gray
            cb.setLineDash(4f, 4f);
            cb.moveTo(35, 250);
            cb.lineTo(width - 35, 250);
            cb.stroke();
            cb.setLineDash(0f, 0f); // Reset dash style

            // Bottom section
            String uniqueRegId = "#NRCM-" + registration.getId() + "-" + String.format("%03d", registration.getEvent().getId());

            // Add Registry ID on the left side of the bottom section
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(90);
            footerTable.setWidths(new float[]{1.5f, 1f});
            
            // Left Cell: Registry ID
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPaddingTop(120); // Push cell down within document flow
            leftCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            
            Font footerLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.GRAY);
            Paragraph regLabel = new Paragraph("REGISTRY ID", footerLabelFont);
            leftCell.addElement(regLabel);
            
            Font monoFont = FontFactory.getFont(FontFactory.COURIER_BOLD, 13, Color.BLACK);
            Paragraph regVal = new Paragraph(uniqueRegId, monoFont);
            regVal.setSpacingBefore(3);
            leftCell.addElement(regVal);
            footerTable.addCell(leftCell);

            // Right Cell: Empty to allow space for barcode drawn with Absolute Coordinates
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            footerTable.addCell(rightCell);
            
            document.add(footerTable);

            // Draw Barcode dynamically with Absolute Coordinates in the bottom right
            float barcodeStartX = width - 210;
            float barcodeY = 100;
            float barcodeHeight = 35;
            cb.setColorFill(new Color(40, 40, 40));
            float[] barWidths = {2f, 4f, 1f, 5f, 2f, 3f, 5f, 1f, 4f, 2f, 3f, 1f, 5f, 2f};
            float currentX = barcodeStartX;
            for (float barw : barWidths) {
                cb.rectangle(currentX, barcodeY, barw, barcodeHeight);
                cb.fill();
                currentX += barw + 2f; // bar width + gap
            }

            // Draw "NODAL HALL ENTRY" text below the barcode
            try {
                cb.beginText();
                cb.setFontAndSize(BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false), 8);
                cb.setColorFill(new Color(128, 128, 128));
                cb.showTextAligned(Element.ALIGN_CENTER, "NODAL HALL ENTRY PASS", barcodeStartX + 45, 85, 0);
                cb.endText();
            } catch (Exception e) {
                // Fallback or ignore if font loading has issues
            }

            document.close();
        }

        return out.toByteArray();
    }

    private PdfPCell createGridCell(String label, Font labelFont, String value, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(10);
        
        Paragraph lbl = new Paragraph(label, labelFont);
        cell.addElement(lbl);
        
        Paragraph val = new Paragraph(value != null ? value : "", valueFont);
        val.setSpacingBefore(3);
        cell.addElement(val);
        
        return cell;
    }

    private PdfPCell createCell(String value, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Override
    public byte[] generateGuidelinesPdf(String track) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 54, 54, 54, 54);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        float width = PageSize.A4.getWidth();
        float height = PageSize.A4.getHeight();

        PdfContentByte cb = writer.getDirectContent();
        
        // Draw Gold & Navy Borders
        cb.setLineWidth(3f);
        cb.setColorStroke(new Color(212, 175, 55)); // Gold
        cb.rectangle(30, 30, width - 60, height - 60);
        cb.stroke();

        cb.setLineWidth(1f);
        cb.setColorStroke(new Color(26, 54, 93)); // Navy
        cb.rectangle(35, 35, width - 70, height - 70);
        cb.stroke();

        // Header Section
        Paragraph space = new Paragraph(" ");
        space.setSpacingAfter(10);
        document.add(space);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(212, 175, 55));
        Paragraph headerPara = new Paragraph("NRCM NATIONAL SYMPOSIUM & HACKATHON 2026", headerFont);
        headerPara.setAlignment(Element.ALIGN_CENTER);
        document.add(headerPara);

        String trackTitle = "GENERAL HARDWARE & SOFTWARE COMPETITION";
        String problemStatements = "General product design, telemetry, smart systems, and cloud connectivity solutions.";
        String trackUpper = track != null ? track.toLowerCase().trim() : "general";

        if (trackUpper.contains("agriculture")) {
            trackTitle = "AGRICULTURE, FOODTECH & RURAL AGRO-AUTOMATION";
            problemStatements = "Post-harvest processing, intelligent crop disease scanners, automated cold storage telemetry, smart soil nutrient sensors, and rural micro-economy support nodes.";
        } else if (trackUpper.contains("healthcare")) {
            trackTitle = "HEALTHCARE, BIOMEDICAL MEDTECH & PATIENT TELEMETRY";
            problemStatements = "Wearable real-time diagnostic trackers, AI-driven emergency patient triage screeners, low-cost portable health diagnostics, and smart bio-medical waste routing.";
        } else if (trackUpper.contains("smartcities") || trackUpper.contains("smart cities") || trackUpper.contains("urban")) {
            trackTitle = "SMART CITIES, URBAN INFRASTRUCTURE & HOME AUTOMATION";
            problemStatements = "Intelligent signal grid controllers, municipal smart garbage routing networks, self-sovereign telemetry metrics, and home solar energy distribution models.";
        } else if (trackUpper.contains("robotics") || trackUpper.contains("iot") || trackUpper.contains("drone")) {
            trackTitle = "ROBOTICS, DRONES, EDGE COMPUTING & TELEMETRY IoT";
            problemStatements = "Disaster rescue drones, autonomous target surveys, ROS-based navigation edge nodes, automated sorting conveyor models, and real-time edge telemetry hubs.";
        } else if (trackUpper.contains("cybersecurity") || trackUpper.contains("blockchain") || trackUpper.contains("security")) {
            trackTitle = "CYBERSECURITY, BLOCKCHAIN LEDGER & DEEPFAKE SHIELDS";
            problemStatements = "Deepfake video verification nodes, decentralized degree certificate storage, tamper-proof academic credentials, and edge firewall network packet filters.";
        } else if (trackUpper.contains("aiml") || trackUpper.contains("ai") || trackUpper.contains("analytics")) {
            trackTitle = "AI/ML, SMART DATA ANALYTICS & NLP INTERNET NODES";
            problemStatements = "Real-time sign language translation engines, smart industrial anomaly classifiers, semantic parsing neural nodes, and multi-dimensional dashboard prediction tools.";
        }

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(26, 54, 93));
        Paragraph titlePara = new Paragraph(trackTitle, titleFont);
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingBefore(5);
        titlePara.setSpacingAfter(15);
        document.add(titlePara);

        // Divider
        Paragraph div = new Paragraph("--------------------------------------------------------------------------------------------------", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.LIGHT_GRAY));
        div.setAlignment(Element.ALIGN_CENTER);
        div.setSpacingAfter(15);
        document.add(div);

        Font sectionHeadFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(26, 54, 93));
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

        // Section 1: Problem statements
        document.add(new Paragraph("1. Official Track Challenge & Themes", sectionHeadFont));
        Paragraph p1 = new Paragraph(problemStatements, bodyFont);
        p1.setSpacingBefore(3);
        p1.setSpacingAfter(12);
        document.add(p1);

        // Section 2: Evaluation Metrics
        document.add(new Paragraph("2. Evaluation Rubrics & Metrics", sectionHeadFont));
        Paragraph p2 = new Paragraph("• Novelty and Technical Innovation (Weight: 30%)\n" +
                                     "• Technical Feasibility & Clean Code Architecture (Weight: 30%)\n" +
                                     "• Social Impact, Business Viability, & Scalability (Weight: 20%)\n" +
                                     "• Live Working Prototype Demo & Stress Testing (Weight: 20%)", bodyFont);
        p2.setSpacingBefore(3);
        p2.setSpacingAfter(12);
        document.add(p2);

        // Section 3: Roadmap & Timeline
        document.add(new Paragraph("3. Symposium Roadmap & Evaluation Stages", sectionHeadFont));
        Paragraph p3 = new Paragraph("• Stage 01: Idea Abstract Submission & Screening Audit (COMPLETED)\n" +
                                     "• Stage 02: Hardware/Software Working Prototype Live Evaluation (ACTIVE)\n" +
                                     "• Stage 03: Grand Finale 36-Hour Continuous Dev, Stress Telemetry, & VC Mentorship (UPCOMING)", bodyFont);
        p3.setSpacingBefore(3);
        p3.setSpacingAfter(12);
        document.add(p3);

        // Section 4: AI Graphic Box representation
        document.add(new Paragraph("4. System Architecture Representation (Generated)", sectionHeadFont));
        
        PdfPTable gridTable = new PdfPTable(1);
        gridTable.setWidthPercentage(100);
        gridTable.setSpacingBefore(5);
        gridTable.setSpacingAfter(15);

        PdfPCell gridCell = new PdfPCell();
        gridCell.setBackgroundColor(new Color(248, 250, 252));
        gridCell.setBorderColor(new Color(226, 232, 240));
        gridCell.setBorderWidth(1f);
        gridCell.setPadding(10);

        Font monoFont = FontFactory.getFont(FontFactory.COURIER_BOLD, 8, new Color(43, 108, 176));
        Paragraph monoPara = new Paragraph(
            "+=============================================================+\n" +
            "| [EDGE TELEMETRY] ---> (COURIER DECODER) ---> [CENTRAL HUB]  |\n" +
            "|      |                     |                      |         |\n" +
            "| (Smart Sensor)       (JPA Repository)      (Admin Dashboard)|\n" +
            "+=============================================================+\n" +
            "   [SYSTEM AUTO-GENERATED GRAPHIC SCHEMA: SECURE AUTHENTICATED]   ",
            monoFont
        );
        monoPara.setAlignment(Element.ALIGN_CENTER);
        gridCell.addElement(monoPara);
        gridTable.addCell(gridCell);
        document.add(gridTable);

        // Section 5: Convener Signature Block
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setSpacingBefore(10);

        Font footerValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
        Font footerLblFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

        PdfPCell c1 = new PdfPCell();
        c1.setBorder(Rectangle.NO_BORDER);
        c1.addElement(new Paragraph("Prof. Srinivas Reddy", footerValFont));
        c1.addElement(new Paragraph("Symposium Convener, NRCM", footerLblFont));
        footerTable.addCell(c1);

        PdfPCell c2 = new PdfPCell();
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph signR = new Paragraph("Symposium Board", footerValFont);
        signR.setAlignment(Element.ALIGN_RIGHT);
        Paragraph labelR = new Paragraph("CAMPUS TECHNICAL COMMITTEE", footerLblFont);
        labelR.setAlignment(Element.ALIGN_RIGHT);
        c2.addElement(signR);
        c2.addElement(labelR);
        footerTable.addCell(c2);

        document.add(footerTable);
        document.close();

        return out.toByteArray();
    }

    @Override
    public byte[] generatePreviousRegistrationsCsv(List<com.campus.eventmanagement.entity.PreviousRegistration> list) {
        StringBuilder csv = new StringBuilder();
        // CSV Header
        csv.append("Event Name,Domain,Team Name,College,Participant Name,Email,Phone,T-Shirt Size,Food Preference,Status,Registration Date\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (com.campus.eventmanagement.entity.PreviousRegistration p : list) {
            // Save only the approved team details, not the rejected/pending members
            if (!"APPROVED".equals(p.getStatus())) {
                continue;
            }
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    escapeCsv(p.getEventName()),
                    escapeCsv(p.getDomain() != null ? p.getDomain() : "N/A"),
                    escapeCsv(p.getTeamName()),
                    escapeCsv(p.getCollege()),
                    escapeCsv(p.getParticipantName()),
                    escapeCsv(p.getEmail()),
                    escapeCsv(p.getPhone()),
                    escapeCsv(p.getTshirtSize()),
                    escapeCsv(p.getFoodPreference()),
                    escapeCsv(p.getStatus()),
                    p.getRegistrationDate() != null ? p.getRegistrationDate().format(dtf) : "N/A"
            ));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] generatePreviousRegistrationsPdf(List<com.campus.eventmanagement.entity.PreviousRegistration> list) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        // Landscape A4 document layout to fit 9 detailed columns beautifully
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 40, 20);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(26, 54, 93));
        Paragraph title = new Paragraph("Campus Event Historical Registrations Ledger Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        // Subtitle
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY);
        Paragraph subtitle = new Paragraph("Generated on: " + java.time.LocalDateTime.now().toString() + " | Entries count: " + list.size(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(15);
        document.add(subtitle);

        // 9 Detailed Columns Table
        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 2.0f, 2.0f, 2.0f, 2.5f, 1.8f, 1.0f, 1.0f, 1.2f});

        // Headers
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        String[] headers = {"Domain", "Team Name", "College", "Participant", "Email", "Phone", "T-Shirt", "Food", "Status"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
            cell.setBackgroundColor(new Color(26, 54, 93)); // Premium Navy
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Data Rows
        Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);

        for (com.campus.eventmanagement.entity.PreviousRegistration p : list) {
            // Save only the approved team details, not the rejected/pending members
            if (!"APPROVED".equals(p.getStatus())) {
                continue;
            }
            table.addCell(createCell(p.getDomain() != null ? p.getDomain() : "N/A", dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getTeamName(), dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getCollege(), dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getParticipantName(), dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getEmail(), dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getPhone(), dataFont, Element.ALIGN_LEFT));
            table.addCell(createCell(p.getTshirtSize(), dataFont, Element.ALIGN_CENTER));
            table.addCell(createCell(p.getFoodPreference(), dataFont, Element.ALIGN_CENTER));
            table.addCell(createCell(p.getStatus(), dataFont, Element.ALIGN_CENTER));
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }
}
