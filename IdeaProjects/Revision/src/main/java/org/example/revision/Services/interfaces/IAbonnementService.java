package org.example.revision.Services.interfaces;

import org.example.revision.entities.Abonnement;
import java.util.List;

public interface IAbonnementService {
    Abonnement addAbonnement(Abonnement abonnement);
    Abonnement updateAbonnement(Long id, Abonnement abonnement);
    void deleteAbonnement(Long id);
    Abonnement getAbonnementById(Long id);
    List<Abonnement> getAllAbonnements();
}
