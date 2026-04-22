package tn.esprit.gestionpartner.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.ApplicationResponse;
import tn.esprit.gestionpartner.dto.ScheduleInterviewRequest;
import tn.esprit.gestionpartner.dto.UpdateApplicationStatusRequest;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.ApplicationRepository;
import tn.esprit.gestionpartner.repositories.JobOfferRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final UserClient userClient;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8089}")
    private String baseUrl;

    @Value("${app.auto-shortlist.enabled:true}")
    private boolean autoShortlistEnabled;

    @Value("${app.auto-shortlist.threshold:75}")
    private int autoShortlistThreshold;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobOfferRepository jobOfferRepository,
                              UserClient userClient,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.userClient = userClient;
        this.notificationService = notificationService;
    }

    // =====================================
    // APPLY WITH FILES (PDF CV + PDF motivation)
    // =====================================
    @Transactional
    public String applyWithFiles(Long jobOfferId, MultipartFile cv, MultipartFile motivationPdf) {

        UserDTO student = getCurrentUser();

        if (jobOfferId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jobOfferId is required.");
        }
        if (cv == null || cv.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV PDF is required.");
        }
        if (motivationPdf == null || motivationPdf.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivation PDF is required.");
        }

        // ✅ validate pdf (content-type OR filename)
        if (!isPdf(cv)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV must be a PDF.");
        }
        if (!isPdf(motivationPdf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivation must be a PDF.");
        }

        JobOffer offer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        // ✅ offer closed
        if (offer.getStatus() == OfferStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This offer is closed.");
        }

        // ✅ deadline
        if (offer.getDeadline() != null && offer.getDeadline().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline expired.");
        }

        // ✅ prevent duplicate
        if (applicationRepository.existsByStudentIdAndJobOfferId(student.getId(), offer.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already applied to this offer.");
        }

        // ✅ 1) Extract text from PDFs BEFORE saving URLs (score uses real text)
        String cvText = extractPdfText(cv);
        String motivationText = extractPdfText(motivationPdf);

        // ✅ 2) save files
        String cvUrl = saveFile(cv, "cv", student.getId(), offer.getId());
        String motivationUrl = saveFile(motivationPdf, "motivation", student.getId(), offer.getId());

        Application app = new Application();
        app.setStudentId(student.getId());
        app.setJobOffer(offer);

        // ✅ keep your existing fields
        app.setCvUrl(cvUrl);
        app.setMotivation(motivationUrl);

        // ✅ advanced score using extracted text
        int score = calculateAdvancedScore(student, offer, cvText, motivationText);
        app.setScore(score);

        // ✅ AUTO SHORTLISTING (config)
        ApplicationStatus initialStatus = ApplicationStatus.SENT;
        boolean autoFlag = false;

        if (autoShortlistEnabled && score >= autoShortlistThreshold) {
            initialStatus = ApplicationStatus.SHORTLISTED;
            autoFlag = true;
        }

        app.setStatus(initialStatus);
        app.setAutoShortlisted(autoFlag);

        applicationRepository.save(app);

        // ✅ Notify partner employer
        Long partnerEmployerId = offer.getPartner().getEmployerId();

        String msgPartner = "New application received for the offer: " + offer.getTitle()
                + " (score " + score + "/100)"
                + (initialStatus == ApplicationStatus.SHORTLISTED ? " ✅ Auto-Shortlisted" : "");

        notificationService.push(
                partnerEmployerId,
                NotificationType.APPLICATION_RECEIVED,
                msgPartner,
                "/partner/offers/" + offer.getId() + "/applications"
        );

        // ✅ Notify learner
        String msgLearner = "Your application has been sent for: " + offer.getTitle()
                + (initialStatus == ApplicationStatus.SHORTLISTED ? " ✅ Shortlisted" : "");

        notificationService.push(
                student.getId(),
                NotificationType.STATUS_UPDATED,
                msgLearner,
                "/user/applications"
        );

        return "✅ Application submitted successfully.";
    }

    // =====================================
    // MY APPLICATIONS
    // =====================================
    public List<ApplicationResponse> myApplications() {
        UserDTO student = getCurrentUser();

        return applicationRepository
                .findByStudentIdOrderByAppliedAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================
    // PARTNER - VIEW APPLICATIONS FOR OFFER
    // =====================================
    public List<ApplicationResponse> applicationsForOffer(Long offerId) {

        JobOffer offer = jobOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        return applicationRepository
                .findByJobOfferIdOrderByAppliedAtDesc(offer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================
    // UPDATE STATUS
    // =====================================
    @Transactional
    public String updateStatus(Long applicationId, UpdateApplicationStatusRequest request) {

        if (applicationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "applicationId is required.");
        }
        if (request == null || request.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required.");
        }

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setStatus(request.getStatus());

        if (request.getStatus() == ApplicationStatus.SHORTLISTED) {
            app.setAutoShortlisted(false); // ✅ manuel
        }
        applicationRepository.save(app);

        notificationService.push(
                app.getStudentId(),
                NotificationType.STATUS_UPDATED,
                "Application status updated: " + request.getStatus() + " (Offre: " + app.getJobOffer().getTitle() + ")",
                "/user/applications"
        );

        notificationService.push(
                app.getJobOffer().getPartner().getEmployerId(),
                NotificationType.STATUS_UPDATED,
                "You have updated the status of an application -> " + request.getStatus(),
                "/partner/offers/" + app.getJobOffer().getId() + "/applications"
        );

        return "Status updated: " + request.getStatus();
    }

    // =====================================
    // SCHEDULE INTERVIEW
    // =====================================
    @Transactional
    public String scheduleInterview(Long applicationId, ScheduleInterviewRequest request) {

        if (applicationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "applicationId is required.");
        }
        if (request == null || request.getInterviewAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "interviewAt is required.");
        }
        if (request.getMeetLink() == null || request.getMeetLink().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "meetLink is required.");
        }

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setInterviewAt(request.getInterviewAt());
        app.setInterviewMeetLink(request.getMeetLink().trim());
        app.setInterviewNote(request.getNote() != null ? request.getNote().trim() : null);

        app.setStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(app);

        notificationService.push(
                app.getStudentId(),
                NotificationType.INTERVIEW_SCHEDULED,
                "Interview scheduled for the offer: " + app.getJobOffer().getTitle(),
                "/user/applications"
        );

        notificationService.push(
                app.getJobOffer().getPartner().getEmployerId(),
                NotificationType.INTERVIEW_SCHEDULED,
                "Scheduled interview scheduled.",
                "/partner/offers/" + app.getJobOffer().getId() + "/applications"
        );

        return "✅ Interview scheduled successfully.";
    }

    // =====================================
    // HAS APPLIED
    // =====================================
    public Map<String, Boolean> hasApplied(Long offerId) {
        UserDTO student = getCurrentUser();
        boolean applied = applicationRepository.existsByStudentIdAndJobOfferId(student.getId(), offerId);
        return Map.of("applied", applied);
    }

    // =====================================
    // MAPPER
    // =====================================
    private ApplicationResponse toResponse(Application a) {

        Partner partner = a.getJobOffer().getPartner();

        String partnerName = (partner.getCompanyName() != null && !partner.getCompanyName().isBlank())
                ? partner.getCompanyName()
                : "Company";

        String studentUsername = "Unknown";
        String studentEmail = "";
        try {
            UserDTO student = userClient.getUserById(a.getStudentId());
            if (student != null) {
                studentUsername = student.getUsername();
                studentEmail = student.getEmail();
            }
        } catch (Exception e) {}

        return new ApplicationResponse(
                a.getId(),
                a.getStatus(),
                a.getAppliedAt(),

                a.getJobOffer().getId(),
                a.getJobOffer().getTitle(),
                a.getJobOffer().getLocation(),

                partner.getId(),
                partnerName,

                studentUsername,
                studentEmail,

                a.getCvUrl(),
                a.getMotivation(),
                a.getScore(),
                a.isAutoShortlisted(),

                a.getInterviewAt(),
                a.getInterviewMeetLink(),
                a.getInterviewNote()
        );
    }

    // =====================================
    // SECURITY HELPER
    // =====================================
    private UserDTO getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }

        UserDTO user = userClient.getUserByUsername(auth.getName());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
        }
        return user;
    }

    // =====================================
    // FILE UTILS
    // =====================================
    private boolean isPdf(MultipartFile file) {
        String contentType = file.getContentType();
        String name = file.getOriginalFilename();

        boolean byType = contentType != null && contentType.equalsIgnoreCase("application/pdf");
        boolean byName = name != null && name.toLowerCase().endsWith(".pdf");

        return byType || byName;
    }

    private String saveFile(MultipartFile file, String prefix, Long studentId, Long offerId) {
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String safeName = prefix + "_s" + studentId + "_o" + offerId + "_" + UUID.randomUUID() + ".pdf";
            File dest = new File(dir, safeName);

            Files.write(dest.toPath(), file.getBytes());

            return baseUrl + "/uploads/" + safeName;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed.");
        }
    }

    // =====================================
    // ✅ PDF TEXT EXTRACTION (PDFBox)
    // =====================================
    private String extractPdfText(MultipartFile pdf) {
        try (PDDocument doc = PDDocument.load(pdf.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            if (text == null) return "";
            // normalize
            return text.replaceAll("\\s+", " ").trim();
        } catch (Exception e) {
            // if extraction fails, do not block apply (but score will be lower)
            return "";
        }
    }

    // =====================================
// ✅ ADVANCED SCORE (0–100) - FIXED
// =====================================
    private int calculateAdvancedScore(UserDTO student, JobOffer offer, String cvText, String motivationText) {

        int score = 0;

        // Normalize
        String cv = normalize(cvText);
        String mot = normalize(motivationText);

        // -----------------------------
        // A) File presence bonus (0–10)  ✅ small, not 30
        // -----------------------------
        boolean hasCv = cv != null && !cv.isBlank();
        boolean hasMot = mot != null && !mot.isBlank();

        if (hasCv) score += 5;
        if (hasMot) score += 5;

        // If both are basically empty => stop here (only tiny bonus)
        if (cv.length() < 120 && mot.length() < 120) {
            return clamp(score); // max 10
        }

        // -----------------------------
        // B) Text quality (0–25)
        // -----------------------------
        score += computeTextQualityScore(cv, mot); // max 25

        // -----------------------------
        // C) Requirements matching (0–55)
        // If requirements empty -> use quality only (no match score)
        // -----------------------------
        score += computeRequirementsMatchScore(offer.getRequirements(), cv, mot); // max 55

        // -----------------------------
        // D) Bonus timing (0–10)
        // -----------------------------
        if (offer.getDeadline() != null) score += 5;
        if (offer.getMode() != null && offer.getMode().name().equalsIgnoreCase("REMOTE")) score += 5;

        return clamp(score);
    }

    private int computeTextQualityScore(String cv, String mot) {
        int s = 0;

        // CV quality (0–10)
        // give points only if enough text exists
        if (cv.length() >= 200) s += 4;
        if (cv.length() >= 600) s += 3;
        if (cv.length() >= 1200) s += 3;

        // Motivation quality (0–15) - more important
        if (mot.length() >= 200) s += 5;
        if (mot.length() >= 700) s += 5;
        if (mot.length() >= 1200) s += 5;

        return Math.min(s, 25);
    }

    private int computeRequirementsMatchScore(String requirements, String cvText, String motivationText) {

        // ✅ if requirements empty, do not punish candidate
        if (requirements == null || requirements.isBlank()) return 0;

        String req = normalize(requirements);
        String cv = normalize(cvText);
        String mot = normalize(motivationText);

        List<String> keywords = extractKeywords(req);

        // ✅ anti-abuse: if no extracted keywords, no match points
        if (keywords.isEmpty()) return 0;

        // ✅ anti-abuse: if text too short, no big match
        if (cv.length() < 80 && mot.length() < 120) return 0;

        int hitCv = 0;
        int hitMot = 0;

        for (String k : keywords) {
            if (k.isBlank()) continue;
            if (cv.contains(k)) hitCv++;
            if (mot.contains(k)) hitMot++;
        }

        double ratioCv = (double) hitCv / (double) keywords.size();
        double ratioMot = (double) hitMot / (double) keywords.size();

        // motivation is more important than cv
        double combined = (ratioCv * 0.4) + (ratioMot * 0.6);

        // ✅ optional: require at least one hit to get points
        if (hitCv + hitMot == 0) return 0;

        return (int) Math.round(combined * 55.0);
    }

    private List<String> extractKeywords(String requirements) {

        String cleaned = requirements
                .toLowerCase()
                .replaceAll("[^a-z0-9+.#\\s,/\\-]", " ");

        String[] parts = cleaned.split("[,\\/\\-\\n\\r]+");

        return java.util.Arrays.stream(parts)
                .map(String::trim)
                // ✅ keep meaningful tokens only
                .filter(s -> s.length() >= 3)
                .map(this::normalize)
                .distinct()
                .limit(30)
                .toList();
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("\\s+", " ")
                .trim();
    }

    private int clamp(int score) {
        if (score > 100) return 100;
        if (score < 0) return 0;
        return score;
    }
}