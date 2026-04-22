package tn.esprit.gestionuser.controllers;

import tn.esprit.gestionuser.dto.UpdateUserRequest;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ──────────────────────────────────────
    //  DASHBOARDS
    // ──────────────────────────────────────
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminDashboard() {
        return ResponseEntity.ok("Bienvenue Admin !");
    }

    @GetMapping("/trainer/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<String> trainerDashboard() {
        return ResponseEntity.ok("Bienvenue Trainer !");
    }

    @GetMapping("/learner/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'LEARNER')")
    public ResponseEntity<String> learnerDashboard() {
        return ResponseEntity.ok("Bienvenue Learner !");
    }

    @GetMapping("/partner/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARTNER')")
    public ResponseEntity<String> partnerDashboard() {
        return ResponseEntity.ok("Bienvenue Partner !");
    }

    // ──────────────────────────────────────
    //  READ ALL
    // ──────────────────────────────────────
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ──────────────────────────────────────
    //  READ ONE
    // ──────────────────────────────────────
    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/admin/users/by-username/{username}")
    // @PreAuthorize("hasRole('ADMIN')") // Optional: depending on if we want internal only or not
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    // ──────────────────────────────────────
    //  UPDATE
    // ──────────────────────────────────────
    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // ──────────────────────────────────────
    //  DELETE
    // ──────────────────────────────────────
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé avec succès !");
    }
}