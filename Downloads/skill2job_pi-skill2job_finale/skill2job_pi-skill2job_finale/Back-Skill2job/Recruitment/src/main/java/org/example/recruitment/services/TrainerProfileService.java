package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.recruitment.Repositories.TrainerProfileRepository;
import org.example.recruitment.entities.TrainerProfile;
import org.example.recruitment.entities.TrainerProfileStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainerProfileService {

    private final TrainerProfileRepository repo;

    public TrainerProfile create(TrainerProfile profile) {
        return repo.save(profile);
    }

    public List<TrainerProfile> getAll() {
        return repo.findAll();
    }

    public TrainerProfile getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TrainerProfile not found: " + id));
    }

    public TrainerProfile getByUserId(Long userId) {
        return repo.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("TrainerProfile not found for userId: " + userId));
    }

    public TrainerProfile update(Long id, TrainerProfile incoming) {
        TrainerProfile existing = getById(id);

        if (incoming.getMainSpeciality() != null) existing.setMainSpeciality(incoming.getMainSpeciality());
        if (incoming.getLevel() != null) existing.setLevel(incoming.getLevel());
        if (incoming.getStatus() != null) existing.setStatus(incoming.getStatus());

        // userId should not change
        return repo.save(existing);
    }

    public TrainerProfile changeStatus(Long id, TrainerProfileStatus status) {
        TrainerProfile existing = getById(id);
        existing.setStatus(status);
        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("TrainerProfile not found: " + id);
        repo.deleteById(id);
    }
}
