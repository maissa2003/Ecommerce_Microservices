package org.example.revision.Services.interfaces;

import org.example.revision.entities.Inscription;
import java.util.List;

public interface IInscriptionService {
    Inscription addInscription(Inscription inscription);
    Inscription updateInscription(Long id, Inscription inscription);
    void deleteInscription(Long id);
    Inscription getInscriptionById(Long id);
    List<Inscription> getAllInscriptions();
}
