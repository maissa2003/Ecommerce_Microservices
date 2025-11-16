package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.CoursRepository;
import org.example.revision.Services.interfaces.ICoursService;
import org.example.revision.entities.Cours;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CoursServiceImpl implements ICoursService {

    private final CoursRepository coursRepository;

    @Override
    public Cours addCours(Cours cours) {
        return coursRepository.save(cours);
    }

    @Override
    public Cours updateCours(Long id, Cours cours) {
        cours.setNumCours(id);
        return coursRepository.save(cours);
    }

    @Override
    public void deleteCours(Long id) {
        coursRepository.deleteById(id);
    }

    @Override
    public Cours getCoursById(Long id) {
        return coursRepository.findById(id).orElse(null);
    }

    @Override
    public List<Cours> getAllCours() {
        return coursRepository.findAll();
    }
}
