package tn.esprit.gestionexam.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.gestionexam.entities.Examen;

public interface ExamRepository extends JpaRepository<Examen, Long> {
}



