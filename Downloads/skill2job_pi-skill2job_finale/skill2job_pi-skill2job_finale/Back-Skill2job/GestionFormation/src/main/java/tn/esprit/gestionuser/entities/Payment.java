package tn.esprit.gestionuser.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long courseId;

    // ── Currency pricing ─────────────────────────────────────────
    @Column(nullable = false)
    private Double originalPrice;

    @Column(nullable = false)
    private Double finalPrice;       // after coupon

    @Column(nullable = false)
    private String currency;

    // ── Points pricing (wallet) ───────────────────────────────────
    private Double originalPointsPrice;  // points set on course
    private Double finalPointsPrice;     // after coupon

    // ── Coupon ───────────────────────────────────────────────────
    private String couponCode;
    private Double discountPercentage;    // percent applied e.g. 20.0

    // ── Status & method ──────────────────────────────────────────
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    // ── Card info (credit card only) ──────────────────────────────
    @Column(unique = true, nullable = false)
    private String transactionId;

    private String cardLast4;
    private String cardType;
    private String cardHolderName;
    private String billingCountry;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.PENDING;
    }

    public enum PaymentStatus {
        PENDING, APPROVED, REJECTED, REFUNDED
    }

    public enum PaymentMethod {
        CREDIT_CARD, WALLET, BANK_TRANSFER
    }
}