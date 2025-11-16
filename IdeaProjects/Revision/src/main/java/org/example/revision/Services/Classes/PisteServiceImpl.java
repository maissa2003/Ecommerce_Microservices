package org.example.revision.Services.Classes;

import lombok.RequiredArgsConstructor;
import org.example.revision.Repositories.PisteRepository;
import org.example.revision.Services.interfaces.IpisteService;
import org.example.revision.entities.Piste;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PisteServiceImpl implements IpisteService {

    private final PisteRepository pisteRepository;

    @Override
    public Piste addPiste(Piste piste) {
        return pisteRepository.save(piste);
    }

    @Override
    public Piste updatePiste(Long id, Piste piste) {
        piste.setNumPiste(id);
        return pisteRepository.save(piste);
    }

    @Override
    public void deletePiste(Long id) {
        pisteRepository.deleteById(id);
    }

    @Override
    public Piste getPisteById(Long id) {
        return pisteRepository.findById(id).orElse(null);
    }

    @Override
    public List<Piste> getAllPistes() {
        return pisteRepository.findAll();
    }
}
