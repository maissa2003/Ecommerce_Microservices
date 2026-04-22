package org.example.recruitment.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_details")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TrainerDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1 application => 1 details (unique)
    @OneToOne(optional = false)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private TrainerApplication application;

    @Column(length = 30)
    private String level; // JUNIOR / MID / SENIOR

    @Column(columnDefinition = "TEXT")
    private String skills; // ex: "Spring Boot, Angular, Docker"

    private Integer yearsExperience;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }
}
