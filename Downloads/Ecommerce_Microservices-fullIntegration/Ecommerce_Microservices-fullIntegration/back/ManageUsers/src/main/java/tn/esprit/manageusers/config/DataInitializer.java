package tn.esprit.manageusers.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.manageusers.entities.Role;
import tn.esprit.manageusers.entities.Utilisateur;
import tn.esprit.manageusers.repositories.UtilisateurRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UtilisateurRepository repo, PasswordEncoder passwordEncoder) {
        return args -> {

            upsert(repo, passwordEncoder, "Admin", "admin@gmail.com", "12345678", Role.ADMIN);
            upsert(repo, passwordEncoder, "Client", "client@gmail.com", "12345678", Role.CUSTOMER);
            upsert(repo, passwordEncoder, "Souhe", "souhe@gmail.com", "12345678", Role.CUSTOMER);
            upsert(repo, passwordEncoder, "User Test", "user@gmail.com", "password123", Role.CUSTOMER);

            System.out.println("✅ All users initialized with correct BCrypt passwords");
            System.out.println("📊 Total users: " + repo.count());
        };
    }

    // Creates user if not exists, always updates password to ensure BCrypt encoding
    private void upsert(UtilisateurRepository repo, PasswordEncoder encoder,
            String nom, String email, String rawPassword, Role role) {

        Utilisateur user = repo.findByEmail(email)
                .orElseGet(() -> Utilisateur.builder().nom(nom).email(email).role(role).build());

        // Always re-encode password — ensures it's always BCrypt on startup
        user.setPassword(encoder.encode(rawPassword));
        user.setRole(role);
        user.setNom(nom);

        repo.save(user);
        System.out.println("✅ User ready: " + email);
    }
}