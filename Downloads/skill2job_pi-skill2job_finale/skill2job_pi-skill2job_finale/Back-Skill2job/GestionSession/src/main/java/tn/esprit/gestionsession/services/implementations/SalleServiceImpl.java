package tn.esprit.gestionsession.services.implementations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.entities.Salle;
import tn.esprit.gestionsession.repositories.SalleRepository;
import tn.esprit.gestionsession.services.interfaces.SalleInterface;

import java.util.List;

@Service
public class SalleServiceImpl implements SalleInterface {

    @Autowired
    private SalleRepository salleRepository;

    @Override
    public Salle addSalle(Salle salle) {



            return salleRepository.save(salle);


    }

    @Override
    public List<Salle> getAllSalles() {
        return salleRepository.findAll();
    }

    @Override
    public Salle getSalleById(Long id) {
        return salleRepository.findById(id).orElse(null);
    }

    @Override
    public Salle updateSalle(Long id, Salle salle) {
        salle.setId(id);
        return salleRepository.save(salle);
    }

    @Override
    public void deleteSalle(Long id) {
        salleRepository.deleteById(id);
    }
}
