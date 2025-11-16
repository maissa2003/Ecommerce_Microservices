package org.example.revision.Repositories;

import org.example.revision.entities.Abonnement;
import org.example.revision.entities.TypeAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    // Récupérer les abonnements par type et triés par date de début
    Set<Abonnement> findByTypeAbonnementOrderByDateDebut(TypeAbonnement typeAbonnement);

    // Récupérer les abonnements créés entre deux dates
    List<Abonnement> findByDateDebutBetween(LocalDate startDate, LocalDate endDate);
}
