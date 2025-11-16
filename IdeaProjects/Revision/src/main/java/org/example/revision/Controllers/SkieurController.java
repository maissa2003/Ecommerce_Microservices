package org.example.revision.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.revision.Services.interfaces.ISkieurService;
import org.example.revision.entities.Skieur;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skieurs")

public class SkieurController {

    private final ISkieurService skieurService;
    public SkieurController(ISkieurService skieurService) {
        this.skieurService = skieurService;
    }


    @PostMapping
    public Skieur addSkieur(@RequestBody Skieur skieur) {
        return skieurService.addSkieur(skieur);
    }

    @PutMapping("/{id}")
    public Skieur updateSkieur(@PathVariable Long id, @RequestBody Skieur skieur) {
        return skieurService.updateSkieur(id, skieur);
    }

    @DeleteMapping("/{id}")
    public void deleteSkieur(@PathVariable Long id) {
        skieurService.deleteSkieur(id);
    }

    @GetMapping("/{id}")
    public Skieur getSkieurById(@PathVariable Long id) {
        return skieurService.getSkieurById(id);
    }

    @GetMapping
    public List<Skieur> getAllSkieurs() {
        return skieurService.getAllSkieurs();
    }
}
