package org.example.revision.Services.interfaces;

import org.example.revision.entities.Moniteur;
import java.util.List;

public interface IMoniteurService {
    Moniteur addMoniteur(Moniteur moniteur);
    Moniteur updateMoniteur(Long id, Moniteur moniteur);
    void deleteMoniteur(Long id);
    Moniteur getMoniteurById(Long id);
    List<Moniteur> getAllMoniteurs();
}
