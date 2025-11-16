package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.AbonnementRepository;
import org.example.revision.Services.interfaces.IAbonnementService;
import org.example.revision.entities.Abonnement;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AbonnementServiceImpl implements IAbonnementService {

    private final AbonnementRepository abonnementRepository;



    @Override
    public Abonnement addAbonnement(Abonnement abonnement) {
        return abonnementRepository.save(abonnement);
    }

    @Override
    public Abonnement updateAbonnement(Long id, Abonnement abonnement) {
        abonnement.setNumAbon(id);

        return abonnementRepository.save(abonnement);
    }

    @Override
    public void deleteAbonnement(Long id) {
        abonnementRepository.deleteById(id);
    }

    @Override
    public Abonnement getAbonnementById(Long id) {
        return abonnementRepository.findById(id).orElse(null);
    }

    @Override
    public List<Abonnement> getAllAbonnements() {
        return abonnementRepository.findAll();
    }
}
