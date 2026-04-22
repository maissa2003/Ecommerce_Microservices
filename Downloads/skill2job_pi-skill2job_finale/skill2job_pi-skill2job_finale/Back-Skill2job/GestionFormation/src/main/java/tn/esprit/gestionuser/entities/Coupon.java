package tn.esprit.gestionuser.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data @NoArgsConstructor @AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;               // e.g. "SUMMER25"

    @Column(nullable = false)
    private Double discountPercentage; // 20.0 = 20% off

    @Column(nullable = false)
    private LocalDate expiryDate;      // unlimited uses until expired

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
    }

    @Transient
    public boolean isValid() {
        return active && !LocalDate.now().isAfter(expiryDate);
    }
}