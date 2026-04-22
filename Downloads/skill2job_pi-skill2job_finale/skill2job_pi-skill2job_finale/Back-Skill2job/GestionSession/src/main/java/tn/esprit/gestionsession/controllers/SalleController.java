package tn.esprit.gestionsession.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.gestionsession.entities.Salle;
import tn.esprit.gestionsession.services.interfaces.SalleInterface;

import java.util.List;

@RestController
@RequestMapping("/api/salles")
public class SalleController {

    @Autowired
    private SalleInterface salleService;

    @PostMapping("/add")
    public Salle add(@RequestBody Salle salle) {
        return salleService.addSalle(salle);
    }

    @GetMapping("/all")
    public List<Salle> getAll() {
        return salleService.getAllSalles();
    }

    // 🔥 only change here
    @GetMapping("/{id:\\d+}")
    public Salle getById(@PathVariable Long id) {
        return salleService.getSalleById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        salleService.deleteSalle(id);
    }

    @PutMapping("/update/{id}")
    public Salle update(@PathVariable Long id, @RequestBody Salle salle) {
        return salleService.updateSalle(id, salle);
    }
}