package org.example.revision.Services.interfaces;

import org.example.revision.entities.Piste;
import java.util.List;

public interface IpisteService {
    Piste addPiste(Piste piste);
    Piste updatePiste(Long id, Piste piste);
    void deletePiste(Long id);
    Piste getPisteById(Long id);
    List<Piste> getAllPistes();
}
