package tn.esprit.gestionsession.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionsession.entities.PcOffer;
import tn.esprit.gestionsession.services.implementations.PcScraperService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pc")
// ❌ REMOVED @CrossOrigin — CORS is handled globally in SecurityConfig
public class PcController {

    private final PcScraperService pcScraperService;

    public PcController(PcScraperService pcScraperService) {
        this.pcScraperService = pcScraperService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) Double maxBudget,
            @RequestParam(required = false) Integer minRam
    ) {
        try {

            List<PcOffer> offers = pcScraperService.scrapeSite();

            List<PcOffer> filtered = offers.stream()
                    .filter(o -> maxBudget == null || o.getPrice() <= maxBudget)
                    .filter(o -> minRam == null || (o.getRam() != null && o.getRam() >= minRam))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(filtered);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(500)
                    .body("Scraping failed: " + e.getMessage());
        }
    }
}