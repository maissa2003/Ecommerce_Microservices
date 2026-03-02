package org.example.recruitment.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.recruitment.entities.TrainerProfile;
import org.example.recruitment.services.TrainerProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trainer-profiles")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:49797"
})
@RequiredArgsConstructor
public class TrainerProfileFrontController {

    private final TrainerProfileService service;

    @GetMapping("/me")
    public TrainerProfile myProfile(@RequestParam Long userId) {
        return service.getByUserId(userId);
    }
}
