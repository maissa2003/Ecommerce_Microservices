package tn.esprit.gestionsession.services.interfaces;

import tn.esprit.gestionsession.entities.Bloc;

import java.util.List;

public interface BlocInterface {
    public Bloc addBloc(Bloc b);


    Bloc updateBloc(long id, Bloc b);

    public void deleteBloc(long id);
    public List<Bloc> getAllBloc();
}
