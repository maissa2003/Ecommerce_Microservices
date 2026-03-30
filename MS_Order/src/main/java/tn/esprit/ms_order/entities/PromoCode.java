package tn.esprit.ms_order.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @NotNull
    private DiscountType discountType;

    @NotNull
    private Double value; // either % or exact amount

    @NotNull
    private LocalDateTime expiryDate;

    @NotNull
    private Integer maxUsages;

    private Integer currentUsages = 0;

    private Boolean active = true;

    public PromoCode() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public Integer getMaxUsages() { return maxUsages; }
    public void setMaxUsages(Integer maxUsages) { this.maxUsages = maxUsages; }

    public Integer getCurrentUsages() { return currentUsages; }
    public void setCurrentUsages(Integer currentUsages) { this.currentUsages = currentUsages; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
