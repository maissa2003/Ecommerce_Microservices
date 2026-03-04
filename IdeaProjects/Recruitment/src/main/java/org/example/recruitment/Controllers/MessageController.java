package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.Message;
import org.example.recruitment.services.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:49797"
})
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ✅ Envoyer un message
    @PostMapping
    public Message send(@RequestBody Message message) {
        return messageService.send(message);
    }

    // ✅ Conversation par applicationId
    @GetMapping("/conversation/{applicationId}")
    public List<Message> getConversation(@PathVariable Long applicationId) {
        return messageService.getConversation(applicationId);
    }

    // ✅ Messages non lus
    @GetMapping("/unread/{receiverId}")
    public List<Message> getUnread(@PathVariable Long receiverId) {
        return messageService.getUnread(receiverId);
    }

    // ✅ Count non lus
    @GetMapping("/unread/{receiverId}/count")
    public Map<String, Long> countUnread(@PathVariable Long receiverId) {
        return Map.of("count", messageService.countUnread(receiverId));
    }

    // ✅ Marquer comme lu
    @PutMapping("/read/{applicationId}/{receiverId}")
    public void markAsRead(
            @PathVariable Long applicationId,
            @PathVariable Long receiverId
    ) {
        messageService.markAsRead(applicationId, receiverId);
    }
}