package org.example.recruitment.Repositories;

import org.example.recruitment.entities.TrainerDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainerDetailsRepository extends JpaRepository<TrainerDetails, Long> {
    Optional<TrainerDetails> findByApplication_Id(Long applicationId);
    boolean existsByApplication_Id(Long applicationId);
}
