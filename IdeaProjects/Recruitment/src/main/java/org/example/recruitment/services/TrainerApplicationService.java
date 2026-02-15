package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.recruitment.Repositories.TrainerApplicationRepository;
import org.example.recruitment.entities.ApplicationStatus;
import org.example.recruitment.entities.TrainerApplication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainerApplicationService {

    private final TrainerApplicationRepository repository;

    // CREATE
    public TrainerApplication submit(TrainerApplication application) {
        if (repository.existsByUserId(application.getUserId())) {
            throw new IllegalStateException("This user already submitted an application.");
        }
        application.setStatus(ApplicationStatus.PENDING);
        return repository.save(application);
    }
    public TrainerApplication updateApplication(Long id, TrainerApplication updated) {
        TrainerApplication existing = getById(id);

        if (existing.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("You can edit the application only while status is PENDING.");
        }

        if (updated.getCvUrl() != null && !updated.getCvUrl().isBlank()) {
            existing.setCvUrl(updated.getCvUrl());
        }
        if (updated.getMotivation() != null && !updated.getMotivation().isBlank()) {
            existing.setMotivation(updated.getMotivation());
        }

        return repository.save(existing);
    }


    // READ
    public TrainerApplication getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));
    }

    public TrainerApplication getByUserId(Long userId) {
        return repository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found for userId: " + userId));
    }

    public List<TrainerApplication> list(ApplicationStatus status) {
        if (status == null) return repository.findAll();
        return repository.findAllByStatus(status);
    }

    // UPDATE (Admin)
    public TrainerApplication updateStatus(Long id, ApplicationStatus status) {
        TrainerApplication app = getById(id);
        app.setStatus(status);
        return repository.save(app);
    }

    public void delete(Long id) {
    }
}
