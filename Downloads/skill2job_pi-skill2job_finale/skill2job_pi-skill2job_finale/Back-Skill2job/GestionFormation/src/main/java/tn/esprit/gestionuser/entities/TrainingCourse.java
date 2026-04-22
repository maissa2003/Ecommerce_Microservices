package tn.esprit.gestionuser.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode
@Builder
public class TrainingCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // ── Currency price ────────────────────────────────────────────
    @Column(nullable = false)
    private Double price;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "points_price")
    private Integer pointsPrice;

    // ✅ NOUVEAU : trainer assigné à ce cours
    @Column(name = "trainer_id")
    private Long trainerId;

    // ── Files ─────────────────────────────────────────────────────
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "course_pdfs", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "pdf_url")
    @Builder.Default
    private List<String> pdfUrls = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currency == null || currency.trim().isEmpty()) currency = "USD";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (currency == null || currency.trim().isEmpty()) currency = "USD";
    }
}