package org.example.revision.Services.interfaces;

import org.example.revision.entities.Skieur;
import java.util.List;

public interface ISkieurService {
    Skieur addSkieur(Skieur skieur);
    Skieur updateSkieur(Long id, Skieur skieur);
    void deleteSkieur(Long id);
    Skieur getSkieurById(Long id);
    List<Skieur> getAllSkieurs();
}
