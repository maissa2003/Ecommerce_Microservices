package org.example.recruitment.Repositories;

import org.example.recruitment.entities.ApplicationStatus;
import org.example.recruitment.entities.TrainerApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerApplicationRepository extends JpaRepository<TrainerApplication, Long> {

    Optional<TrainerApplication> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<TrainerApplication> findAllByStatus(ApplicationStatus status);
}
