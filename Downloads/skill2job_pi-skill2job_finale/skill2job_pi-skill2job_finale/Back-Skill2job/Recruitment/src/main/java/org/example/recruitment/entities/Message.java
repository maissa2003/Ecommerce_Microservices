package org.example.recruitment.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;      // userId de l'expéditeur
    private Long receiverId;    // userId du destinataire

    @Column(columnDefinition = "TEXT")
    private String content;

    private Long applicationId; // lien avec la candidature

    private boolean isRead = false;

    private String senderRole;  // "ADMIN" ou "TRAINER"

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}