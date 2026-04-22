package tn.esprit.gestionuser.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Long id;
    private String transactionId;
    private Long userId;
    private String username;       // ✅ username instead of userId
    private Long courseId;
    private Double originalPrice;
    private String couponCode;
    private Double discountPercentage;    private Double finalPrice;
    private String currency;
    private String status;
    private String paymentMethod;
    private String cardLast4;
    private String cardType;
    private String cardHolderName;
    private String billingCountry;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
}