package tn.esprit.gestionsession.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/signal")
    public void signal(@Payload SignalMessage message) {

        // Broadcast presence signals to everyone in the room
        if ("JOIN".equals(message.getType())
                || "LEAVE".equals(message.getType())
                || "HERE".equals(message.getType())
                || "CAMERA_ON".equals(message.getType())
                || "CAMERA_OFF".equals(message.getType())) {

            messagingTemplate.convertAndSend(
                    "/topic/room/" + message.getRoomCode(),
                    message
            );
        }
        // For OFFER, ANSWER, ICE_CANDIDATE - send privately
        else {
            messagingTemplate.convertAndSendToUser(
                    message.getTo(),
                    "/queue/signal",
                    message
            );
        }
    }
}