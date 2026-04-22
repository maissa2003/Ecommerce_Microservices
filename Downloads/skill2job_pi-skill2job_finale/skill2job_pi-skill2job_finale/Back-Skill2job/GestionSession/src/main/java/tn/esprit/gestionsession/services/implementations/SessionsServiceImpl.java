package tn.esprit.gestionsession.services.implementations;

import feign.FeignException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tn.esprit.gestionsession.clients.FormationClient;
import tn.esprit.gestionsession.clients.UserClient;
import tn.esprit.gestionsession.dto.FormationDTO;
import tn.esprit.gestionsession.dto.UserDTO;
import tn.esprit.gestionsession.entities.*;
import tn.esprit.gestionsession.repositories.*;
import tn.esprit.gestionsession.services.interfaces.SessionsInterface;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionsServiceImpl implements SessionsInterface {

    private final SessionsRepository sessionsRepository;
    private final EquipmentRepository equipmentRepository;
    private final SessionEquipmentRepository sessionEquipmentRepository;
    private final UserClient userClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    private final FormationClient formationClient;

    @Autowired
    public SessionsServiceImpl(
            SessionsRepository sessionsRepository,
            EquipmentRepository equipmentRepository,
            SessionEquipmentRepository sessionEquipmentRepository,
            UserClient userClient,
            SimpMessagingTemplate messagingTemplate,
            RoomRepository roomRepository,
            FormationClient formationClient
    ) {
        this.sessionsRepository = sessionsRepository;
        this.equipmentRepository = equipmentRepository;
        this.sessionEquipmentRepository = sessionEquipmentRepository;
        this.userClient = userClient;
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
        this.formationClient = formationClient;
    }

    @Override
    @Transactional
    public Sessions addSession(Sessions session) {

        // ── Validate formationId exists in formation-service ──────
        if (session.getFormationId() != null) {
            try {
                FormationDTO formation = formationClient.getFormationById(session.getFormationId());
                if (formation == null) {
                    throw new RuntimeException("Formation not found with id: " + session.getFormationId());
                }
            } catch (FeignException.NotFound e) {
                throw new RuntimeException("Formation not found with id: " + session.getFormationId());
            } catch (FeignException e) {
                throw new RuntimeException("Could not reach formation-service: " + e.getMessage());
            }
        }

        // ── Duration check ────────────────────────────────────────
        LocalDateTime start = session.getStartAt();
        LocalDateTime end   = session.getEndAt();

        long minutes = java.time.Duration.between(start, end).toMinutes();
        if (minutes <= 0 || minutes > 120) {
            throw new RuntimeException("Session cannot exceed 2 hours");
        }

        // ── ONLINE: create room ───────────────────────────────────
        if (session.getType() == SessionType.ONLINE) {
            Room room = new Room();
            room.setRoomCode(UUID.randomUUID().toString());
            room.setMeetingLink("http://localhost:4200/live/" + room.getRoomCode());
            room.setStartAt(start);
            room.setEndAt(end);
            roomRepository.save(room);
            room.setSession(session);
            session.setRoom(room);
        }

        // ── ONSITE: check salle + equipment ──────────────────────
        if (session.getType() == SessionType.ONSITE) {
            if (session.getSalle() == null) {
                throw new RuntimeException("OFFLINE session must have a salle");
            }

            LocalDateTime startWithBuffer = start.minusHours(1);
            LocalDateTime endWithBuffer   = end.plusHours(1);

            boolean salleBusy = sessionsRepository.existsSalleConflictWithBuffer(
                    session.getSalle().getId(), startWithBuffer, endWithBuffer);

            if (salleBusy) {
                throw new RuntimeException("Salle requires 1 hour buffer between sessions");
            }

            if (session.getSessionEquipments() != null) {
                for (SessionEquipment se : session.getSessionEquipments()) {
                    Equipment equipment = equipmentRepository.findById(se.getEquipment().getId())
                            .orElseThrow(() -> new RuntimeException("Equipment not found"));

                    Integer reserved = sessionEquipmentRepository.sumReservedEquipment(
                            equipment.getId(), start, end);

                    int available = equipment.getQuantity() - reserved;
                    if (se.getQuantityUsed() > available) {
                        throw new RuntimeException(
                                equipment.getName() + " only " + available + " available during this time"
                        );
                    }
                    se.setSession(session);
                }
            }
        }

        return sessionsRepository.save(session);
    }

    @Override
    public void removeSession(Long id) {
        sessionsRepository.deleteById(id);
    }

    @Override
    public void updateSession(Sessions updatedSession, Long id) {
        Sessions existing = sessionsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        existing.setStartAt(updatedSession.getStartAt());
        existing.setEndAt(updatedSession.getEndAt());

        if (existing.getRoom() != null) {
            existing.getRoom().setStartAt(updatedSession.getStartAt());
            existing.getRoom().setEndAt(updatedSession.getEndAt());
        }

        sessionsRepository.save(existing);
    }

    @Override
    public List<Sessions> getSessions() {
        return sessionsRepository.findAllWithRoomAndSalle();
    }

    @Override
    @Transactional
    public Sessions joinSession(Long sessionId, Long userId) {
        boolean alreadyJoined = sessionsRepository.countParticipant(sessionId, userId) > 0;
        if (alreadyJoined) {
            return sessionsRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        }
        sessionsRepository.addParticipant(sessionId, userId);
        return sessionsRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Override
    @Transactional
    public Sessions leaveSession(Long sessionId, Long userId) {
        boolean isJoined = sessionsRepository.countParticipant(sessionId, userId) > 0;
        if (!isJoined) {
            throw new RuntimeException("User is not in this session");
        }

        sessionsRepository.removeParticipant(sessionId, userId);

        Sessions session = sessionsRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getRoom() != null) {
            messagingTemplate.convertAndSend(
                    "/topic/room/" + session.getRoom().getRoomCode(),
                    java.util.Map.of(
                            "type", "LEAVE",
                            "username", Optional.ofNullable(userClient.getUserById(userId))
                                    .map(UserDTO::getUsername)
                                    .orElse("unknown")
                    )
            );
        }

        return session;
    }

    @Override
    public Sessions getSessionById(Long id) {
        return sessionsRepository.findByIdWithRoom(id);
    }
}