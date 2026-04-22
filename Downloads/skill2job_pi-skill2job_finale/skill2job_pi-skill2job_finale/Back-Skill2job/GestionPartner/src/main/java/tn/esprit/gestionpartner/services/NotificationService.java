package tn.esprit.gestionpartner.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.NotificationResponse;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.Notification;
import tn.esprit.gestionpartner.entities.NotificationType;
import tn.esprit.gestionpartner.repositories.NotificationRepository;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserClient userClient;

    public NotificationService(NotificationRepository notificationRepository, UserClient userClient) {
        this.notificationRepository = notificationRepository;
        this.userClient = userClient;
    }

    @Transactional
    public void push(Long receiverId, NotificationType type, String message, String link) {
        Notification n = new Notification();
        n.setUserId(receiverId);
        n.setType(type);
        n.setMessage(message);
        n.setLink(link);
        n.setRead(false);
        notificationRepository.save(n);
    }

    public List<NotificationResponse> myNotifications() {
        UserDTO me = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getType(),
                        n.getMessage(),
                        n.getLink(),
                        n.isRead(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    public Map<String, Long> unreadCount() {
        UserDTO me = getCurrentUser();
        long c = notificationRepository.countByUserIdAndReadFalse(me.getId());
        return Map.of("unread", c);
    }

    @Transactional
    public void markRead(Long id) {
        UserDTO me = getCurrentUser();
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (n.getUserId() == null || !n.getUserId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead() {
        UserDTO me = getCurrentUser();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
        for (Notification n : list) n.setRead(true);
        notificationRepository.saveAll(list);
    }

    @Transactional
    public String deleteMyNotification(Long id) {
        UserDTO me = getCurrentUser();

        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (n.getUserId() == null || !n.getUserId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        notificationRepository.delete(n);
        return "Notification deleted";
    }

    // ✅ NEW: clear all my notifications
    @Transactional
    public String clearAllMyNotifications() {
        UserDTO me = getCurrentUser();
        notificationRepository.deleteByUserId(me.getId());
        return "All notifications cleared";
    }

    private UserDTO getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }
        UserDTO user = userClient.getUserByUsername(auth.getName());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
        }
        return user;
    }
}