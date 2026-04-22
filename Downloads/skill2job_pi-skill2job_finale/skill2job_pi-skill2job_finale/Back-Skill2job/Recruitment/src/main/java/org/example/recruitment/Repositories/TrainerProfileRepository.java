package org.example.recruitment.Repositories;

import org.example.recruitment.entities.TrainerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainerProfileRepository extends JpaRepository<TrainerProfile, Long> {
    Optional<TrainerProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
