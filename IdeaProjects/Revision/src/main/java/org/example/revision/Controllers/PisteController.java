package org.example.revision.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.revision.Services.interfaces.IpisteService;
import org.example.revision.entities.Piste;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pistes")

public class PisteController {

    private final IpisteService pisteService;
    public PisteController(IpisteService pisteService) {
        this.pisteService = pisteService;
    }

    @PostMapping
    public Piste addPiste(@RequestBody Piste piste) {
        return pisteService.addPiste(piste);
    }

    @PutMapping("/{id}")
    public Piste updatePiste(@PathVariable Long id, @RequestBody Piste piste) {
        return pisteService.updatePiste(id, piste);
    }

    @DeleteMapping("/{id}")
    public void deletePiste(@PathVariable Long id) {
        pisteService.deletePiste(id);
    }

    @GetMapping("/{id}")
    public Piste getPisteById(@PathVariable Long id) {
        return pisteService.getPisteById(id);
    }

    @GetMapping
    public List<Piste> getAllPistes() {
        return pisteService.getAllPistes();
    }
}
