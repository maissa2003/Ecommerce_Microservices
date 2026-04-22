package tn.esprit.gestionsession.services.interfaces;



import tn.esprit.gestionsession.entities.Salle;

import java.util.List;

public interface SalleInterface {

    Salle addSalle(Salle salle);

    List<Salle> getAllSalles();

    Salle getSalleById(Long id);

    Salle updateSalle(Long id, Salle salle);

    void deleteSalle(Long id);
}
