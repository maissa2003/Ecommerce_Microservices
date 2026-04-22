package tn.esprit.gestionpartner.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionpartner.dto.PartnerDashboardResponse;
import tn.esprit.gestionpartner.services.PartnerDashboardService;

@RestController
@RequestMapping("/api/partner")

public class PartnerDashboardController {

    private final PartnerDashboardService dashboardService;

    public PartnerDashboardController(PartnerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN')")
    public ResponseEntity<PartnerDashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}