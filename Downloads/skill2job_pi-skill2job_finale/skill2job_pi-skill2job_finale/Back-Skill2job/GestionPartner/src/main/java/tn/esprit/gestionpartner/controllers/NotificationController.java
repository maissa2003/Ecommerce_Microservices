package tn.esprit.gestionpartner.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionpartner.dto.NotificationResponse;
import tn.esprit.gestionpartner.services.NotificationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> myNotifications() {
        return ResponseEntity.ok(notificationService.myNotifications());
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(notificationService.unreadCount());
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok("OK");
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok("OK");
    }

    // ✅ delete ONE notification (owner only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LEARNER','PARTNER','ADMIN','TRAINER')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.deleteMyNotification(id));
    }

    // ✅ NEW: CLEAR ALL notifications (owner only)
    @DeleteMapping("/clear-all")
    @PreAuthorize("hasAnyRole('LEARNER','PARTNER','ADMIN','TRAINER')")
    public ResponseEntity<String> clearAll() {
        return ResponseEntity.ok(notificationService.clearAllMyNotifications());
    }
}