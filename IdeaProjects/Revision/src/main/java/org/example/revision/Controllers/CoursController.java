package org.example.revision.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.revision.Services.interfaces.ICoursService;
import org.example.revision.entities.Cours;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cours")

public class CoursController {

    private final ICoursService coursService;
    public CoursController(ICoursService coursService) {
        this.coursService = coursService;
    }

    @PostMapping
    public Cours addCours(@RequestBody Cours cours) {
        return coursService.addCours(cours);
    }

    @PutMapping("/{id}")
    public Cours updateCours(@PathVariable Long id, @RequestBody Cours cours) {
        return coursService.updateCours(id, cours);
    }

    @DeleteMapping("/{id}")
    public void deleteCours(@PathVariable Long id) {
        coursService.deleteCours(id);
    }

    @GetMapping("/{id}")
    public Cours getCoursById(@PathVariable Long id) {
        return coursService.getCoursById(id);
    }

    @GetMapping
    public List<Cours> getAllCours() {
        return coursService.getAllCours();
    }
}
