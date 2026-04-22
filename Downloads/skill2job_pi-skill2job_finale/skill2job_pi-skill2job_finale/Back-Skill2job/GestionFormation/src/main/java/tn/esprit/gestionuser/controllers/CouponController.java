package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.entities.Coupon;
import tn.esprit.gestionuser.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    // ── GET all (admin) ───────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Coupon> getAll() {
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }

    // ── CREATE (admin) ────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody Coupon coupon) {
        try {
            coupon.setId(null);
            coupon.setCode(coupon.getCode().trim().toUpperCase());
            if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Coupon code already exists"));
            }
            return ResponseEntity.ok(couponRepository.save(coupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── UPDATE (admin) ────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Coupon body) {
        return couponRepository.findById(id).map(existing -> {
            existing.setCode(body.getCode().trim().toUpperCase());
            existing.setDiscountPercentage(body.getDiscountPercentage());
            existing.setExpiryDate(body.getExpiryDate());
            existing.setActive(body.getActive());
            return ResponseEntity.ok(couponRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── TOGGLE active (admin) ─────────────────────────────────────
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return couponRepository.findById(id).map(existing -> {
            existing.setActive(!existing.getActive());
            return ResponseEntity.ok(couponRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE (admin) ────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!couponRepository.existsById(id))
            return ResponseEntity.notFound().build();
        couponRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── VALIDATE (public / learner) — used by checkout ────────────
    @GetMapping("/validate")
    @PreAuthorize("hasAuthority('ROLE_LEARNER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> validate(@RequestParam String code) {
        return couponRepository.findByCodeIgnoreCase(code.trim())
                .map(c -> {
                    if (!c.isValid()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Coupon expired or inactive"));
                    }
                    return ResponseEntity.ok(Map.of(
                            "valid", true,
                            "discountPercentage", c.getDiscountPercentage(),
                            "code", c.getCode()));
                })
                .orElse(ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid coupon code")));
    }
}