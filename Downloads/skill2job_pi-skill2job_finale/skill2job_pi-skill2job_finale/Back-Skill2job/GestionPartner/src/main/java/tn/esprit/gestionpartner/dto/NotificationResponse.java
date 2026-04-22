package tn.esprit.gestionpartner.dto;

import tn.esprit.gestionpartner.entities.NotificationType;
import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse(Long id, NotificationType type, String message, String link, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.link = link;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public String getMessage() { return message; }
    public String getLink() { return link; }
    public boolean isRead() { return read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}