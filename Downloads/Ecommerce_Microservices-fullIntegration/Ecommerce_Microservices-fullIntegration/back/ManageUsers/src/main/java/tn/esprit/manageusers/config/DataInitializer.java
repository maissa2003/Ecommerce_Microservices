package tn.esprit.manageusers.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.manageusers.entities.Role;
import tn.esprit.manageusers.entities.Utilisateur;
import tn.esprit.manageusers.repositories.UtilisateurRepository;

/**
 * Data Initialization Configuration
 * Automatically inserts default test users into the database on application startup
 */
@Configuration
public class DataInitializer {

    /**
     * Initialize database with default users
     * - Admin user with ADMIN role
     * - Customer user with CUSTOMER role
     *
     * Passwords are encoded using BCrypt for security
     */
    @Bean
    CommandLineRunner init(UtilisateurRepository repo, PasswordEncoder passwordEncoder) {
        return args -> {
            // Clear existing data
            repo.deleteAll();

            // Create and save Admin user
            Utilisateur admin = Utilisateur.builder()
                    .nom("Admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("1234"))  // Password: 1234 (encoded)
                    .role(Role.ADMIN)
                    .build();
            repo.save(admin);
            System.out.println("✅ Admin user created: admin@gmail.com");

            // Create and save Customer user
            Utilisateur customer = Utilisateur.builder()
                    .nom("Client")
                    .email("client@gmail.com")
                    .password(passwordEncoder.encode("1234"))  // Password: 1234 (encoded)
                    .role(Role.CUSTOMER)
                    .build();
            repo.save(customer);
            System.out.println("✅ Customer user created: client@gmail.com");

            // Log total users
            long totalUsers = repo.count();
            System.out.println("📊 Total users initialized: " + totalUsers);
        };
    }
}