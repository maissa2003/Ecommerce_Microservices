package tn.esprit.gestionexam.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_violations")
public class ExamViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examAttemptId;   // which attempt
    private Long learnerId;

    @Enumerated(EnumType.STRING)
    private ViolationType type;   // TAB_SWITCH, COPY_PASTE, FULLSCREEN_EXIT, RIGHT_CLICK

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }

    // getters + setters
}