package tn.esprit.manageusers.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.manageusers.dto.AuthRequest;
import tn.esprit.manageusers.dto.AuthResponse;
import tn.esprit.manageusers.entities.Role;
import tn.esprit.manageusers.entities.Utilisateur;
import tn.esprit.manageusers.repositories.UtilisateurRepository;
import tn.esprit.manageusers.security.Jwttokenprovider;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private Jwttokenprovider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            Optional<Utilisateur> user = utilisateurRepository.findByEmail(authRequest.getEmail());

            if (user.isPresent()) {
                String token = tokenProvider.generateToken(authRequest.getEmail(), user.get().getRole().toString());
                return ResponseEntity.ok(new AuthResponse(token, user.get()));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        // Check if user already exists
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already registered");
        }

        // Encode password
        utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));

        // Set default role if not provided
        if (utilisateur.getRole() == null) {
            utilisateur.setRole(Role.CUSTOMER);
        }

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);
        String token = tokenProvider.generateToken(utilisateur.getEmail(), utilisateur.getRole().toString());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, savedUser));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.substring(7); // Remove "Bearer " prefix
            if (tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                String role = tokenProvider.getRoleFromToken(token);
                return ResponseEntity.ok(new TokenValidationResponse(true, email, role));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new TokenValidationResponse(false, null, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new TokenValidationResponse(false, null, null));
        }
    }

    // Inner class for token validation response
    public static class TokenValidationResponse {
        public boolean valid;
        public String email;
        public String role;

        public TokenValidationResponse(boolean valid, String email, String role) {
            this.valid = valid;
            this.email = email;
            this.role = role;
        }
    }
}