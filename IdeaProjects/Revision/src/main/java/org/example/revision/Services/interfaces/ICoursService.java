package org.example.revision.Services.interfaces;

import org.example.revision.entities.Cours;
import java.util.List;

public interface ICoursService {
    Cours addCours(Cours cours);
    Cours updateCours(Long id, Cours cours);
    void deleteCours(Long id);
    Cours getCoursById(Long id);
    List<Cours> getAllCours();
}
