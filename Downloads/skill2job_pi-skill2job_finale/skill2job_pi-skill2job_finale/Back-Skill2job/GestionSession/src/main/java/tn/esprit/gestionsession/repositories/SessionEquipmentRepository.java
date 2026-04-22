package tn.esprit.gestionsession.repositories;

import tn.esprit.gestionsession.entities.SessionEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionEquipmentRepository
        extends JpaRepository<SessionEquipment, Long> {
    @Query("""
SELECT se
FROM SessionEquipment se
JOIN FETCH se.session s
LEFT JOIN FETCH s.salle
WHERE se.equipment.id = :equipmentId
ORDER BY s.startAt DESC
""")
    List<SessionEquipment> findByEquipmentIdWithSession(Long equipmentId);

    // Calculate reserved quantity during time interval
    @Query("""
        SELECT COALESCE(SUM(se.quantityUsed), 0)
        FROM SessionEquipment se
        WHERE se.equipment.id = :equipmentId
        AND se.session.type = 'ONSITE'
        AND se.session.startAt < :endAt
        AND se.session.endAt > :startAt
    """)
    Integer sumReservedEquipment(
            @Param("equipmentId") Long equipmentId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

}