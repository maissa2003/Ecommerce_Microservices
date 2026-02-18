package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.TrainerProfile;
import org.example.recruitment.entities.TrainerProfileStatus;
import org.example.recruitment.services.TrainerProfileService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/admin/trainer-profiles")
@RequiredArgsConstructor
public class AdminTrainerProfileController {

    private final TrainerProfileService service;

    @PostMapping
    public TrainerProfile create(@RequestBody TrainerProfile profile) {
        return service.create(profile);
    }

    @GetMapping
    public List<TrainerProfile> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TrainerProfile getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/by-user/{userId}")
    public TrainerProfile getByUserId(@PathVariable Long userId) {
        return service.getByUserId(userId);
    }

    @PutMapping("/{id}")
    public TrainerProfile update(@PathVariable Long id, @RequestBody TrainerProfile profile) {
        return service.update(id, profile);
    }

    @PatchMapping("/{id}/status")
    public TrainerProfile changeStatus(@PathVariable Long id, @RequestParam TrainerProfileStatus status) {
        return service.changeStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
