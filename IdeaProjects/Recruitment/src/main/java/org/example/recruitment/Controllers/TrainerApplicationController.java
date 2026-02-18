package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.AdminDecision;
import org.example.recruitment.entities.TrainerDetails;
import org.example.recruitment.services.TrainerApplicationService;
import org.example.recruitment.entities.ApplicationStatus;
import org.example.recruitment.entities.TrainerApplication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:49797"
})
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class TrainerApplicationController {

    private final TrainerApplicationService service;

    // CREATE: submit application
    @PostMapping
    public TrainerApplication submit(@RequestBody TrainerApplication application) {
        return service.submit(application);
    }

    // READ: get by id
    @GetMapping("/{id}")
    public TrainerApplication getById(@PathVariable Long id) {
        return service.getById(id);
    }
    @PutMapping("/{id}")
    public TrainerApplication update(@PathVariable Long id,
                                     @RequestBody TrainerApplication updated) {
        return service.updateApplication(id, updated);
    }


    // READ: get my application (later: use JWT)
    @GetMapping("/me")
    public TrainerApplication getMine(@RequestParam Long userId) {
        return service.getByUserId(userId);
    }

    // READ: list all (admin) + optional filter by status
    @GetMapping
    public List<TrainerApplication> list(@RequestParam(required = false) ApplicationStatus status) {
        return service.list(status);
    }

    // UPDATE: change status (admin)
    @PatchMapping("/{id}/status")
    public TrainerApplication updateStatus(@PathVariable Long id,
                                           @RequestParam ApplicationStatus status) {
        return service.updateStatus(id, status);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    @PostMapping("/{id}/analyze")
    public TrainerDetails analyze(@PathVariable Long id) {
        return service.analyzeApplication(id);
    }

    @PatchMapping("/{id}/decision")
    public TrainerApplication decision(@PathVariable Long id, @RequestParam AdminDecision decision) {
        return service.decide(id, decision);
    }

}
