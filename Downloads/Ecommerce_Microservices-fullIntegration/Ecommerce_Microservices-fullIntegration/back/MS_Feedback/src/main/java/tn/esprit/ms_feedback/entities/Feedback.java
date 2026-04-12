package tn.esprit.ms_feedback.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // L'ID de l'article concerné (référence vers MS_Article)
    @Column(nullable = false)
    private Long articleId;

    // L'ID de l'utilisateur qui poste le feedback
    @Column(nullable = false)
    private Long userId;

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(min = 5, max = 1000, message = "Le commentaire doit contenir entre 5 et 1000 caractères")
    @Column(nullable = false, length = 1000)
    private String comment;

    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    @Column(nullable = false)
    private int rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = FeedbackStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
