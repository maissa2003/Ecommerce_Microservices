package org.example.recruitment.Repositories;

import org.example.recruitment.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // ✅ Conversation entre admin et trainer via applicationId
    List<Message> findByApplicationIdOrderByCreatedAtAsc(Long applicationId);

    // ✅ Messages non lus pour un receiver
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);

    // ✅ Count non lus
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}