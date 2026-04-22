package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.clients.UserClient;
import tn.esprit.gestionuser.dto.UserDTO;
import tn.esprit.gestionuser.dto.PaymentInitiateRequest;
import tn.esprit.gestionuser.dto.PaymentResponseDTO;
import tn.esprit.gestionuser.entities.Payment;
import tn.esprit.gestionuser.services.PaymentService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserClient userClient;

    private PaymentResponseDTO toDTO(Payment p) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(p.getId());
        dto.setTransactionId(p.getTransactionId());
        dto.setUserId(p.getUserId());
        dto.setCourseId(p.getCourseId());
        dto.setOriginalPrice(p.getOriginalPrice());
        dto.setFinalPrice(p.getFinalPrice());
        dto.setCurrency(p.getCurrency());
        dto.setStatus(p.getStatus().name());
        dto.setPaymentMethod(p.getPaymentMethod().name());
        dto.setCardLast4(p.getCardLast4());
        dto.setCardType(p.getCardType());
        dto.setCardHolderName(p.getCardHolderName());
        dto.setBillingCountry(p.getBillingCountry());
        dto.setAdminNotes(p.getAdminNotes());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setApprovedAt(p.getApprovedAt());
        dto.setRejectedAt(p.getRejectedAt());
        // ✅ Coupon fields (replacing discount)
        dto.setCouponCode(p.getCouponCode());
        dto.setDiscountPercentage(p.getDiscountPercentage());
        // ✅ Username via Feign
        try {
            UserDTO user = userClient.getUserById(p.getUserId());
            if (user != null) {
                dto.setUsername(user.getUsername());
            }
        } catch (Exception e) {
            // Log error or set default username if call fails
            dto.setUsername("Unknown User");
        }
        return dto;
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('ROLE_LEARNER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> initiatePayment(@RequestBody PaymentInitiateRequest request,
            Authentication authentication) {
        try {
            Payment payment = paymentService.initiatePayment(authentication.getName(), request);
            return ResponseEntity.ok(toDTO(payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_LEARNER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getMyPayments(Authentication authentication) {
        List<PaymentResponseDTO> result = paymentService.getMyPayments(authentication.getName())
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check-access")
    @PreAuthorize("hasAuthority('ROLE_LEARNER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkAccess(@RequestParam Long courseId,
            Authentication authentication) {
        boolean hasAccess = paymentService.hasAccessToCourse(authentication.getName(), courseId);
        return ResponseEntity.ok(Map.of("hasAccess", hasAccess));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments()
                .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments()
                .stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{paymentId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approvePayment(@PathVariable Long paymentId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String notes = request != null ? request.getOrDefault("notes", "") : "";
            return ResponseEntity.ok(toDTO(paymentService.approvePayment(paymentId, notes)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{paymentId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> rejectPayment(@PathVariable Long paymentId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "No reason provided");
            return ResponseEntity.ok(toDTO(paymentService.rejectPayment(paymentId, reason)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{paymentId}/refund")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> refundPayment(@PathVariable Long paymentId) {
        try {
            return ResponseEntity.ok(toDTO(paymentService.refundPayment(paymentId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(paymentService.getStatistics());
    }
}