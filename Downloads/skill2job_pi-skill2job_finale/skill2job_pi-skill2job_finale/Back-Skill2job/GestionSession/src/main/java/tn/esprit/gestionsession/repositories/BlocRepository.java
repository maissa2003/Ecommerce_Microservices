package tn.esprit.gestionsession.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionsession.entities.Bloc;

public interface BlocRepository extends JpaRepository<Bloc, Long> {
}
