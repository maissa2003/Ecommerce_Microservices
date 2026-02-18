package org.example.recruitment.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_profile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TrainerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // In microservice context: only store userId (no relation to User entity)
    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(length = 80)
    private String mainSpeciality;

    @Column(length = 30)
    private String level; // JUNIOR / MID / SENIOR (string for simplicity)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TrainerProfileStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime activatedAt;

    @PrePersist
    void onCreate() {
        this.activatedAt = LocalDateTime.now();
        if (this.status == null) this.status = TrainerProfileStatus.ACTIVE;
    }
}
