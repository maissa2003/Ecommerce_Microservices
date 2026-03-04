package org.example.recruitment.services;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.Repositories.MessageRepository;
import org.example.recruitment.entities.Message;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public Message send(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long applicationId) {
        return messageRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
    }

    public List<Message> getUnread(Long receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
    }

    public long countUnread(Long receiverId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(receiverId);
    }

    public void markAsRead(Long applicationId, Long receiverId) {
        List<Message> messages = messageRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
        messages.stream()
                .filter(m -> m.getReceiverId().equals(receiverId) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });
    }
}