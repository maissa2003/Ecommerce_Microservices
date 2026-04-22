package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.TrainerDetails;
import org.example.recruitment.services.TrainerDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin/trainer-details")
@RequiredArgsConstructor
public class AdminTrainerDetailsController {

    private final TrainerDetailsService service;

    @PostMapping
    public TrainerDetails create(@RequestBody TrainerDetails details) {
        return service.create(details);
    }

    @GetMapping
    public List<TrainerDetails> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TrainerDetails getById(@PathVariable(name = "id") Long id) {
        return service.getById(id);
    }

    @GetMapping("/by-application/{applicationId}")
    public TrainerDetails getByApplicationId(@PathVariable(name = "applicationId") Long applicationId) {
        return service.getByApplicationId(applicationId);
    }

    @PutMapping("/{id}")
    public TrainerDetails update(@PathVariable(name = "id") Long id, @RequestBody TrainerDetails details) {
        return service.update(id, details);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) {
        service.delete(id);
    }
}
