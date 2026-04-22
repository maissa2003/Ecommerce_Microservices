package tn.esprit.gestionuser.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Integer totalLessons; // Nombre total de leçons

    @Column(nullable = false)
    private Integer completedLessons; // Nombre de leçons complétées

    @Column(nullable = false)
    private Double progressPercentage; // 0.0 - 100.0

    @Column(nullable = false)
    private Boolean isCompleted;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime lastAccessedAt;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Boolean rewardClaimed; // Si la récompense a été donnée

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();

        if (isCompleted == null) {
            isCompleted = false;
        }

        if (rewardClaimed == null) {
            rewardClaimed = false;
        }

        if (progressPercentage == null) {
            progressPercentage = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastAccessedAt = LocalDateTime.now();

        // Calculer le pourcentage
        if (totalLessons > 0) {
            progressPercentage = (completedLessons * 100.0) / totalLessons;
        }

        // Marquer comme complété si 100%
        if (progressPercentage >= 100.0 && !isCompleted) {
            isCompleted = true;
            completedAt = LocalDateTime.now();
        }
    }
}