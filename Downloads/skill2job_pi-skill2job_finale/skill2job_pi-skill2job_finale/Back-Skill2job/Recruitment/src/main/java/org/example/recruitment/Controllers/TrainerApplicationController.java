package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.AdminDecision;
import org.example.recruitment.entities.TrainerDetails;
import org.example.recruitment.services.TrainerApplicationService;
import org.example.recruitment.entities.ApplicationStatus;
import org.example.recruitment.entities.TrainerApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class TrainerApplicationController {

    private final TrainerApplicationService service;

    @PostMapping
    public TrainerApplication submit(@RequestBody TrainerApplication application) {
        return service.submit(application);
    }

    @GetMapping("/{id}")
    public TrainerApplication getById(@PathVariable(name = "id") Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public TrainerApplication update(@PathVariable(name = "id") Long id,
                                     @RequestBody TrainerApplication updated) {
        return service.updateApplication(id, updated);
    }

    @GetMapping("/me")
    public TrainerApplication getMine(@RequestParam(name = "userId") Long userId) {
        return service.getByUserId(userId);
    }

    // ✅ Nouveau endpoint
    @GetMapping("/exists")
    public ResponseEntity<Boolean> exists(@RequestParam(name = "userId") Long userId) {
        return ResponseEntity.ok(service.hasApplication(userId));
    }

    @GetMapping
    public List<TrainerApplication> list(@RequestParam(name = "status", required = false) ApplicationStatus status) {
        return service.list(status);
    }

    @PatchMapping("/{id}/status")
    public TrainerApplication updateStatus(@PathVariable(name = "id") Long id,
                                           @RequestParam(name = "status") ApplicationStatus status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/analyze")
    public TrainerDetails analyze(@PathVariable(name = "id") Long id) {
        return service.analyzeApplication(id);
    }

    @PatchMapping("/{id}/decision")
    public TrainerApplication decision(@PathVariable(name = "id") Long id, @RequestParam(name = "decision") AdminDecision decision) {
        return service.decide(id, decision);
    }
}