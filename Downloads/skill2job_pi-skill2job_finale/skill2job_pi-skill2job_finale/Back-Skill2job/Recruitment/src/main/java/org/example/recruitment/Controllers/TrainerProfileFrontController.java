package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.TrainerProfile;
import org.example.recruitment.services.TrainerProfileService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer-profiles")

@RequiredArgsConstructor
public class TrainerProfileFrontController {

    private final TrainerProfileService service;

    @GetMapping("/me")
    public TrainerProfile myProfile(@RequestParam(name = "userId") Long userId) {
        return service.getByUserId(userId);
    }

    @GetMapping
    public List<TrainerProfile> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TrainerProfile getById(@PathVariable(name = "id") Long id) {
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) {
        service.delete(id);
    }
}
