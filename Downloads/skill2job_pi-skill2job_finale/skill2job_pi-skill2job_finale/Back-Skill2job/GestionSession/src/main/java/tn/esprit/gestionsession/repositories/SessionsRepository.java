package tn.esprit.gestionsession.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.gestionsession.entities.Sessions;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionsRepository extends JpaRepository<Sessions, Long> {

    @Query("SELECT s FROM Sessions s LEFT JOIN FETCH s.room LEFT JOIN FETCH s.salle")
    List<Sessions> findAllWithRoomAndSalle();

    @Query("""
            SELECT COUNT(s) > 0
            FROM Sessions s
            WHERE s.salle.id = :salleId
            AND s.type = 'ONSITE'
            AND (
                    s.startAt < :endAtPlusBuffer
                AND s.endAt > :startAtMinusBuffer
            )
            """)
    boolean existsSalleConflictWithBuffer(
            Long salleId,
            LocalDateTime startAtMinusBuffer,
            LocalDateTime endAtPlusBuffer
    );

    // ✅ KEEP - used for JPQL duplicate check (join)
    @Query("SELECT COUNT(u) > 0 FROM Sessions s JOIN s.participantIds u WHERE s.id = :sessionId AND u = :userId")
    boolean isUserAlreadyJoined(@Param("sessionId") Long sessionId, @Param("userId") Long userId);

    // ✅ Native INSERT - bypasses Hibernate collection
    @Modifying
    @Query(value = "INSERT INTO session_participants (session_id, user_id) VALUES (:sessionId, :userId)", nativeQuery = true)
    void addParticipant(@Param("sessionId") Long sessionId, @Param("userId") Long userId);

    // ✅ Native DELETE - bypasses Hibernate collection
    @Modifying
    @Query(value = "DELETE FROM session_participants WHERE session_id = :sessionId AND user_id = :userId", nativeQuery = true)
    void removeParticipant(@Param("sessionId") Long sessionId, @Param("userId") Long userId);

    // ✅ FIXED - returns int instead of boolean (MySQL COUNT returns Integer not Boolean)
    @Query(value = "SELECT COUNT(*) FROM session_participants WHERE session_id = :sessionId AND user_id = :userId", nativeQuery = true)
    int countParticipant(@Param("sessionId") Long sessionId, @Param("userId") Long userId);

    @Query("SELECT s FROM Sessions s LEFT JOIN FETCH s.room LEFT JOIN FETCH s.salle LEFT JOIN FETCH s.participantIds WHERE s.id = :id")
    Sessions findByIdWithRoom(@Param("id") Long id);

}