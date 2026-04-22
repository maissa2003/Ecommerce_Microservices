package tn.esprit.gestionuser.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Role learnerRole;

    @BeforeEach
    void setUp() {
        learnerRole = new Role(1L, ERole.ROLE_LEARNER);
        sampleUser = new User(1L, "testuser", "test@email.com", "encodedPassword", new HashSet<>(Collections.singletonList(learnerRole)));
    }

    @Test
    @DisplayName("Should login successfully and return JwtResponse")
    void login_WithValidCredentials_ShouldReturnJwtResponse() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(jwtTokenProvider.generateToken(authentication, 1L)).thenReturn("mockedToken");

        JwtResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mockedToken");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getId()).isEqualTo(1L);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should register successfully")
    void register_WithValidData_ShouldReturnSuccessMessage() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("new@email.com");
        registerRequest.setPassword("password");
        registerRequest.setRoles(Collections.singleton("learner"));

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(roleRepository.findByName(ERole.ROLE_LEARNER)).thenReturn(Optional.of(learnerRole));

        String message = authService.register(registerRequest);

        assertThat(message).contains("enregistré avec succès");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when username exists during registration")
    void register_UsernameExists_ShouldThrowException() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("existinguser");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("nom d'utilisateur est déjà pris");
        
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when email exists during registration")
    void register_EmailExists_ShouldThrowException() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("existing@email.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@email.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("email est déjà utilisé");

        verify(userRepository, never()).save(any());
    }
}
