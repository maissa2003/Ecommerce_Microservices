package tn.esprit.gestionuser.repositories;

import tn.esprit.gestionuser.entities.SpinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SpinHistoryRepository extends JpaRepository<SpinHistory, Long> {

    Optional<SpinHistory> findByUserIdAndSpinDate(Long userId, LocalDate spinDate);

    boolean existsByUserIdAndSpinDate(Long userId, LocalDate spinDate);

    List<SpinHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}