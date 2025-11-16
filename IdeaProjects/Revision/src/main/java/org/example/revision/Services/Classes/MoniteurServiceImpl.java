package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.MoniteurRepository;
import org.example.revision.Services.interfaces.IMoniteurService;
import org.example.revision.entities.Moniteur;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MoniteurServiceImpl implements IMoniteurService {

    private final MoniteurRepository moniteurRepository;

    @Override
    public Moniteur addMoniteur(Moniteur moniteur) {
        return moniteurRepository.save(moniteur);
    }

    @Override
    public Moniteur updateMoniteur(Long id, Moniteur moniteur) {
        moniteur.setNumMoniteur(id);
        return moniteurRepository.save(moniteur);
    }

    @Override
    public void deleteMoniteur(Long id) {
        moniteurRepository.deleteById(id);
    }

    @Override
    public Moniteur getMoniteurById(Long id) {
        return moniteurRepository.findById(id).orElse(null);
    }

    @Override
    public List<Moniteur> getAllMoniteurs() {
        return moniteurRepository.findAll();
    }
}
