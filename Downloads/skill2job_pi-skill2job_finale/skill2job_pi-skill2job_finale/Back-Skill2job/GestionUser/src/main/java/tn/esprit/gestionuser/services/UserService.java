package tn.esprit.gestionuser.services;

import tn.esprit.gestionuser.dto.UpdateUserRequest;
import tn.esprit.gestionuser.entities.ERole;
import tn.esprit.gestionuser.entities.Role;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.repositories.RoleRepository;
import tn.esprit.gestionuser.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ──────────────────────────────────────
    //  READ ALL
    // ──────────────────────────────────────
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ──────────────────────────────────────
    //  READ ONE
    // ──────────────────────────────────────
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec le username : " + username));
    }

    // ──────────────────────────────────────
    //  UPDATE
    // ──────────────────────────────────────
    @Transactional
    public User updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));

        // Modifier username si fourni et différent
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            if (!request.getUsername().equals(user.getUsername())
                    && userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Ce username est déjà pris.");
            }
            user.setUsername(request.getUsername());
        }

        // Modifier email si fourni et différent
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé.");
            }
            user.setEmail(request.getEmail());
        }

        // Modifier password si fourni
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Modifier rôles si fournis
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        return userRepository.save(user);
    }

    // ──────────────────────────────────────
    //  DELETE
    // ──────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable avec l'id : " + id);
        }
        userRepository.deleteById(id);
    }

    // ──────────────────────────────────────
    //  HELPER
    // ──────────────────────────────────────
    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        Set<Role> roles = new HashSet<>();
        for (String roleStr : requestedRoles) {
            switch (roleStr.toLowerCase()) {
                case "admin"   -> roles.add(findRole(ERole.ROLE_ADMIN));
                case "trainer" -> roles.add(findRole(ERole.ROLE_TRAINER));
                case "partner" -> roles.add(findRole(ERole.ROLE_PARTNER));
                case "learner" -> roles.add(findRole(ERole.ROLE_LEARNER));
                default -> throw new RuntimeException("Rôle inconnu : " + roleStr);
            }
        }
        return roles;
    }

    private Role findRole(ERole eRole) {
        return roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + eRole));
    }
}
