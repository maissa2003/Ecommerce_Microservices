package tn.esprit.gestionuser.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.gestionuser.dto.JwtResponse;
import tn.esprit.gestionuser.dto.LoginRequest;
import tn.esprit.gestionuser.dto.RegisterRequest;
import tn.esprit.gestionuser.entities.ERole;
import tn.esprit.gestionuser.entities.Role;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.repositories.RoleRepository;
import tn.esprit.gestionuser.repositories.UserRepository;
import tn.esprit.gestionuser.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // ──────────────────────────────────────
    //  LOGIN
    // ──────────────────────────────────────
    public JwtResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé après authentification"));

        String token = jwtTokenProvider.generateToken(authentication, user.getId());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(token, "Bearer", userDetails.getUsername(), roles, user.getId());
    }

    // ──────────────────────────────────────
    //  REGISTER
    // ──────────────────────────────────────
    @Transactional
    public String register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(resolveRoles(request.getRoles()));

        userRepository.save(user);
        return "Utilisateur '" + request.getUsername() + "' enregistré avec succès !";
    }

    // ──────────────────────────────────────
    //  HELPERS
    // ──────────────────────────────────────
    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        Set<Role> roles = new HashSet<>();

        if (requestedRoles == null || requestedRoles.isEmpty()) {
            roles.add(findRole(ERole.ROLE_LEARNER));
            return roles;
        }

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
                .orElseThrow(() -> new RuntimeException(
                        "Rôle introuvable en BDD : " + eRole
                ));
    }
}