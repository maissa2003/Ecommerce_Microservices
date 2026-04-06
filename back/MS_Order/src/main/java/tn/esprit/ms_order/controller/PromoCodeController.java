package tn.esprit.ms_order.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.ms_order.entities.PromoCode;
import tn.esprit.ms_order.services.PromoCodeService;

import java.util.List;

@RestController
@RequestMapping("/api/promos")
public class PromoCodeController {

    private final PromoCodeService service;

    public PromoCodeController(PromoCodeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PromoCode> create(@RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(service.save(promoCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromoCode> update(@PathVariable Long id, @RequestBody PromoCode promoCode) {
        promoCode.setId(id);
        return ResponseEntity.ok(service.save(promoCode));
    }

    @GetMapping
    public ResponseEntity<List<PromoCode>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<PromoCode> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
