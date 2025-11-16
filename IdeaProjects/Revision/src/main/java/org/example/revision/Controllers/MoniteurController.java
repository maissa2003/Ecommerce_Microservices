package org.example.revision.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.revision.Services.interfaces.IMoniteurService;
import org.example.revision.entities.Moniteur;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moniteurs")

public class MoniteurController {

    private final IMoniteurService moniteurService;
    public MoniteurController(IMoniteurService moniteurService) {
        this.moniteurService = moniteurService;
    }

    @PostMapping
    public Moniteur addMoniteur(@RequestBody Moniteur moniteur) {
        return moniteurService.addMoniteur(moniteur);
    }

    @PutMapping("/{id}")
    public Moniteur updateMoniteur(@PathVariable Long id, @RequestBody Moniteur moniteur) {
        return moniteurService.updateMoniteur(id, moniteur);
    }

    @DeleteMapping("/{id}")
    public void deleteMoniteur(@PathVariable Long id) {
        moniteurService.deleteMoniteur(id);
    }

    @GetMapping("/{id}")
    public Moniteur getMoniteurById(@PathVariable Long id) {
        return moniteurService.getMoniteurById(id);
    }

    @GetMapping
    public List<Moniteur> getAllMoniteurs() {
        return moniteurService.getAllMoniteurs();
    }
}
