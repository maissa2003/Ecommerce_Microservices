package tn.esprit.gestionsession.controllers;

import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionsession.clients.FormationClient;
import tn.esprit.gestionsession.clients.UserClient;
import tn.esprit.gestionsession.dto.FormationDTO;
import tn.esprit.gestionsession.dto.UserDTO;
import tn.esprit.gestionsession.entities.Sessions;
import tn.esprit.gestionsession.services.interfaces.SessionsInterface;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionsController {

    private final SessionsInterface sessionsService;
    private final UserClient userClient;
    private final FormationClient formationClient;

    @Autowired
    public SessionsController(SessionsInterface sessionsService,
                              UserClient userClient,
                              FormationClient formationClient) {
        this.sessionsService = sessionsService;
        this.userClient = userClient;
        this.formationClient = formationClient;
    }

    @GetMapping("/test")
    public String test() {
        return "WORKING";
    }

    @PostMapping("/add")
    public Sessions add(@RequestBody Sessions session) {
        return sessionsService.addSession(session);
    }

    @GetMapping("/all")
    public List<Sessions> getAllSessions() {
        return sessionsService.getSessions();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSession(@PathVariable Long id) {
        sessionsService.removeSession(id);
    }

    @PutMapping("/update/{id}")
    public void updateSession(@RequestBody Sessions session, @PathVariable Long id) {
        sessionsService.updateSession(session, id);
    }

    @GetMapping("/{id}")
    public Sessions getSessionById(@PathVariable Long id) {
        return sessionsService.getSessionById(id);
    }

    // ── Dropdown endpoint for admin form ─────────────────────────
    @GetMapping("/formations")
    public List<FormationDTO> getAvailableFormations() {
        try {
            return formationClient.getAllFormations();
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not fetch formations: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('LEARNER')")
    public Sessions joinSession(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        System.out.println("DEBUG: joining session " + id + " for user: " + username);

        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username);
        }

        return sessionsService.joinSession(id, user.getId());
    }

    @PostMapping("/{id}/leave")
    @PreAuthorize("hasRole('LEARNER')")
    public Sessions leaveSession(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        UserDTO user = userClient.getUserByUsername(username);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username);
        }

        return sessionsService.leaveSession(id, user.getId());
    }
}