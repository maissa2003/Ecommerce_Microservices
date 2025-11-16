package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.SkieurRepository;
import org.example.revision.Services.interfaces.ISkieurService;
import org.example.revision.entities.Skieur;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SkieurServiceImpl implements ISkieurService {

    private final SkieurRepository skieurRepository;

    @Override
    public Skieur addSkieur(Skieur skieur) {
        return skieurRepository.save(skieur);
    }

    @Override
    public Skieur updateSkieur(Long id, Skieur skieur) {
        skieur.setNumSkieur(id);
        return skieurRepository.save(skieur);
    }

    @Override
    public void deleteSkieur(Long id) {
        skieurRepository.deleteById(id);
    }

    @Override
    public Skieur getSkieurById(Long id) {
        return skieurRepository.findById(id).orElse(null);
    }

    @Override
    public List<Skieur> getAllSkieurs() {
        return skieurRepository.findAll();
    }
}
