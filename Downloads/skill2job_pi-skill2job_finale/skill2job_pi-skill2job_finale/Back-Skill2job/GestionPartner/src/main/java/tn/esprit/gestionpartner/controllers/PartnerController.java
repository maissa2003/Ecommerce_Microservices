package tn.esprit.gestionpartner.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.entities.PartnerStatus;
import tn.esprit.gestionpartner.services.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")

public class PartnerController {

    private final PartnerPdfExportService partnerPdfExportService;
    private final PartnerService partnerService;
    public PartnerController(PartnerService partnerService,
                             PartnerPdfExportService partnerPdfExportService) {
        this.partnerService = partnerService;
        this.partnerPdfExportService = partnerPdfExportService;
    }

    // =========================
    // EMPLOYER (Connected user): Create Partner Profile
    // =========================
    @PostMapping("/me")
    public ResponseEntity<PartnerResponse> createMyPartner(
            Authentication auth,
            @RequestBody PartnerCreateRequest request
    ) {
        return ResponseEntity.ok(partnerService.createMyPartner(auth.getName(), request));
    }

    // =========================
    // EMPLOYER (Connected user): Get My Partner Profile
    // =========================
    @GetMapping("/me")
    public ResponseEntity<PartnerResponse> getMyPartner(Authentication auth) {
        return ResponseEntity.ok(partnerService.getMyPartner(auth.getName()));
    }

    // =========================
    // EMPLOYER (Connected user): Update My Partner Profile
    // =========================
    @PutMapping("/me")
    public ResponseEntity<PartnerResponse> updateMyPartner(
            Authentication auth,
            @RequestBody PartnerUpdateRequest request
    ) {
        return ResponseEntity.ok(partnerService.updateMyPartner(auth.getName(), request));
    }

    // =========================
    // EMPLOYER (Connected user): Delete My Partner Profile
    // =========================
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyPartner(Authentication auth) {
        partnerService.deleteMyPartner(auth.getName());
        return ResponseEntity.noContent().build();
    }

    // =========================
    // ADMIN: Update Partner Status
    // =========================
    @PutMapping("/{partnerId}/status")
    public ResponseEntity<PartnerResponse> updateStatus(
            @PathVariable Long partnerId,
            @RequestParam PartnerStatus status
    ) {
        return ResponseEntity.ok(partnerService.updateStatus(partnerId, status));
    }

    // =========================
    // ADMIN: Get All Partners
    // =========================
    @GetMapping("/all")
    public ResponseEntity<List<PartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    // =========================
    // ADMIN: Get Partner By Id
    // =========================
    @GetMapping("/{partnerId}")
    public ResponseEntity<PartnerResponse> getPartnerById(@PathVariable Long partnerId) {
        return ResponseEntity.ok(partnerService.getPartnerById(partnerId));
    }

    // =========================
    // ADMIN: Delete Partner By Id
    // =========================
    @DeleteMapping("/{partnerId}")
    public ResponseEntity<Void> adminDeletePartner(@PathVariable Long partnerId) {
        partnerService.adminDeletePartner(partnerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/export/pdf")
    public ResponseEntity<byte[]> exportPartnersPdf() {
        List<PartnerResponse> partners = partnerService.getAllPartners();
        byte[] pdf = partnerPdfExportService.exportPartners(partners);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=partners-premium-report.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}