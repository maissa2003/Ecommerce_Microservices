package org.example.revision.Services.Classes;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.InscriptionRepository;
import org.example.revision.Services.interfaces.IInscriptionService;
import org.example.revision.entities.Inscription;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InscriptionServiceImpl implements IInscriptionService {

    private final InscriptionRepository inscriptionRepository;

    @Override
    public Inscription addInscription(Inscription inscription) {
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription updateInscription(Long id, Inscription inscription) {
        inscription.setNumInscription(id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public void deleteInscription(Long id) {
        inscriptionRepository.deleteById(id);
    }

    @Override
    public Inscription getInscriptionById(Long id) {
        return inscriptionRepository.findById(id).orElse(null);
    }

    @Override
    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }
}
