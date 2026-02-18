package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.recruitment.Repositories.TrainerDetailsRepository;
import org.example.recruitment.entities.TrainerDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainerDetailsService {

    private final TrainerDetailsRepository repo;

    public TrainerDetails create(TrainerDetails details) {
        return repo.save(details);
    }

    public List<TrainerDetails> getAll() {
        return repo.findAll();
    }

    public TrainerDetails getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TrainerDetails not found: " + id));
    }

    public TrainerDetails getByApplicationId(Long applicationId) {
        return repo.findByApplication_Id(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("TrainerDetails not found for applicationId: " + applicationId));
    }

    public TrainerDetails update(Long id, TrainerDetails incoming) {
        TrainerDetails existing = getById(id);

        if (incoming.getLevel() != null) existing.setLevel(incoming.getLevel());
        if (incoming.getSkills() != null) existing.setSkills(incoming.getSkills());
        if (incoming.getYearsExperience() != null) existing.setYearsExperience(incoming.getYearsExperience());
        if (incoming.getAiSummary() != null) existing.setAiSummary(incoming.getAiSummary());

        // application link should not change
        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("TrainerDetails not found: " + id);
        repo.deleteById(id);
    }
}
