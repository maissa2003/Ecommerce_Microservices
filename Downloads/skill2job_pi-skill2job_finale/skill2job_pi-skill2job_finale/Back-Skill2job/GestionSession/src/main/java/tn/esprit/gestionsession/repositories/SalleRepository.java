package tn.esprit.gestionsession.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionsession.entities.Salle;

public interface SalleRepository extends JpaRepository<Salle, Long> {
}
