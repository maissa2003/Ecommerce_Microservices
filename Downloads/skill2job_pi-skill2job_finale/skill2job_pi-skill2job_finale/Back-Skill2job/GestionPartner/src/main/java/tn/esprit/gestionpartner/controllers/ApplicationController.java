package tn.esprit.gestionpartner.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.gestionpartner.dto.ApplicationResponse;
import tn.esprit.gestionpartner.dto.ScheduleInterviewRequest;   // ✅ NEW
import tn.esprit.gestionpartner.dto.UpdateApplicationStatusRequest;
import tn.esprit.gestionpartner.services.ApplicationService;

import java.util.List;

@RestController
@RequestMapping("/api")

public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // =========================
    // STUDENT (LEARNER)
    // =========================

    // ✅ APPLY WITH FILES (Multipart)
    @PostMapping(value = "/applications", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<String> apply(
            @RequestParam("jobOfferId") Long jobOfferId,
            @RequestParam("cv") MultipartFile cv,
            @RequestParam("motivation") MultipartFile motivation
    ) {
        return ResponseEntity.ok(applicationService.applyWithFiles(jobOfferId, cv, motivation));
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<List<ApplicationResponse>> myApplications() {
        return ResponseEntity.ok(applicationService.myApplications());
    }

    @GetMapping("/applications/has-applied/{offerId}")
    @PreAuthorize("hasRole('LEARNER')")
    public ResponseEntity<?> hasApplied(@PathVariable Long offerId) {
        return ResponseEntity.ok(applicationService.hasApplied(offerId));
    }

    // =========================
    // PARTNER / ADMIN
    // =========================

    @GetMapping("/partner/offers/{offerId}/applications")
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> applicationsForOffer(@PathVariable Long offerId) {
        return ResponseEntity.ok(applicationService.applicationsForOffer(offerId));
    }

    @PutMapping("/partner/applications/{id}/status")
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN')")
    public ResponseEntity<String> updateStatus(@PathVariable Long id,
                                               @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request));
    }

    // ✅ NEW: SCHEDULE INTERVIEW (Partner enters date + Google Meet link)
    @PutMapping("/partner/applications/{id}/interview")
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN')")
    public ResponseEntity<String> scheduleInterview(@PathVariable Long id,
                                                    @Valid @RequestBody ScheduleInterviewRequest request) {
        return ResponseEntity.ok(applicationService.scheduleInterview(id, request));
    }
}