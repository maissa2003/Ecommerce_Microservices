package tn.esprit.gestionuser.dto;

import lombok.Data;

@Data
public class PaymentInitiateRequest {
    private Long courseId;
    private Double amount;          // currency amount (null if paying with points)
    private String currency;
    private String paymentMethod;   // CREDIT_CARD, WALLET, BANK_TRANSFER
    private String couponCode;      // optional
    private String cardHolderName;
    private String cardLast4;
    private String cardType;
    private String billingCountry;
}