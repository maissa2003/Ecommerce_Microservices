package tn.esprit.gestionsession.services.implementations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.entities.Bloc;
import tn.esprit.gestionsession.repositories.BlocRepository;
import tn.esprit.gestionsession.services.interfaces.BlocInterface;

import java.util.List;
@Service
public class BlocServiceImpl implements BlocInterface {

    @Autowired
    private BlocRepository blocRepository;


    @Override
    public Bloc addBloc(Bloc b) {
        return blocRepository.save(b);
    }

    @Override
    public Bloc updateBloc(long id, Bloc b) {
        b.setId(id);
        return blocRepository.save(b);
    }

    @Override
    public void deleteBloc(long id) {
        blocRepository.deleteById(id);

    }

    @Override
    public List<Bloc> getAllBloc() {
        return blocRepository.findAll();
    }
}
