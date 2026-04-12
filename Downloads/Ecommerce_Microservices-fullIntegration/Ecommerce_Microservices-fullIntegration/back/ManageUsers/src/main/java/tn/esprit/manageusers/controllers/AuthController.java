package tn.esprit.manageusers.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.manageusers.dto.AuthRequest;
import tn.esprit.manageusers.dto.AuthResponse;
import tn.esprit.manageusers.dto.RegisterRequest;
import tn.esprit.manageusers.dto.UserDTO;
import tn.esprit.manageusers.entities.Role;
import tn.esprit.manageusers.entities.Utilisateur;
import tn.esprit.manageusers.repositories.UtilisateurRepository;
import tn.esprit.manageusers.security.Jwttokenprovider;
import lombok.extern.slf4j.Slf4j;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private Jwttokenprovider tokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        log.debug("Login attempt for email: {}", authRequest.getEmail());
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(),
                    authRequest.getPassword()
                )
            );
            log.debug("Authentication successful for: {}", authRequest.getEmail());

            Utilisateur user = utilisateurRepository
                .findByEmail(authRequest.getEmail())
                .orElseThrow(() -> {
                    log.error("User authenticated but not found in DB: {}", authRequest.getEmail());
                    return new RuntimeException("User not found after authentication");
                });

            String token = tokenProvider.generateToken(
                user.getEmail(),
                user.getRole().toString()
            );
            log.debug("Token generated for: {}", authRequest.getEmail());

            UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getNom(),
                user.getEmail(),
                user.getRole().toString()
            );

            return ResponseEntity.ok(new AuthResponse(token, userDTO));

        } catch (AuthenticationException e) {
            log.warn("Invalid credentials for: {}", authRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Email ou mot de passe incorrect");
        } catch (Exception e) {
            log.error("CRITICAL LOGIN ERROR for {}: {}", authRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Error: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        log.debug("Registration attempt for email: {}", request.getEmail());
        try {
            if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
                log.warn("Registration failed: Email already exists: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already registered");
            }

            Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();

            Utilisateur saved = utilisateurRepository.save(utilisateur);
            log.info("New user registered: {}", saved.getEmail());

            String token = tokenProvider.generateToken(
                saved.getEmail(),
                saved.getRole().toString()
            );

            UserDTO userDTO = new UserDTO(
                saved.getId(),
                saved.getNom(),
                saved.getEmail(),
                saved.getRole().toString()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, userDTO));
        } catch (Exception e) {
            log.error("CRITICAL REGISTRATION ERROR for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Error: " + e.getMessage());
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.substring(7);
            if (tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                String role  = tokenProvider.getRoleFromToken(token);
                return ResponseEntity.ok(new TokenValidationResponse(true, email, role));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new TokenValidationResponse(false, null, null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new TokenValidationResponse(false, null, null));
        }
    }

    public static class TokenValidationResponse {
        public boolean valid;
        public String email;
        public String role;
        public TokenValidationResponse(boolean valid, String email, String role) {
            this.valid = valid; this.email = email; this.role = role;
        }
    }
}