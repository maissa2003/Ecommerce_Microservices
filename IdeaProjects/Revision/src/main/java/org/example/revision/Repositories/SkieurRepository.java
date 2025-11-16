package org.example.revision.Repositories;

import org.example.revision.entities.Skieur;
import org.example.revision.entities.TypeAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkieurRepository extends JpaRepository<Skieur, Long> {
    // Récupérer les skieurs selon le type d'abonnement


    List<Skieur> findByAbonnementsTypeAbonnement(TypeAbonnement typeAbonnement);
}
