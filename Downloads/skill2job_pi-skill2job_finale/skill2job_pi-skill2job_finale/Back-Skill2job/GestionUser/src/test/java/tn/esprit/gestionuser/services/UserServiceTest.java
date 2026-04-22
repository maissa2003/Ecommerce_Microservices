package tn.esprit.gestionuser.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.gestionuser.dto.UpdateUserRequest;
import tn.esprit.gestionuser.entities.ERole;
import tn.esprit.gestionuser.entities.Role;
import tn.esprit.gestionuser.entities.User;
import tn.esprit.gestionuser.repositories.RoleRepository;
import tn.esprit.gestionuser.repositories.UserRepository;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User sampleUser;
    private Role learnerRole;

    @BeforeEach
    void setUp() {
        learnerRole = new Role(1L, ERole.ROLE_LEARNER);
        sampleUser = new User(1L, "testuser", "test@email.com", "encodedPassword", new HashSet<>(Collections.singletonList(learnerRole)));
    }

    @Nested
    @DisplayName("Read Operations")
    class ReadOperations {

        @Test
        @DisplayName("Should return all users")
        void getAllUsers_ShouldReturnList() {
            when(userRepository.findAll()).thenReturn(Arrays.asList(sampleUser));

            List<User> result = userService.getAllUsers();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getUsername()).isEqualTo("testuser");
            verify(userRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return user by ID when exists")
        void getUserById_WhenExists_ShouldReturnUser() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

            User result = userService.getUserById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo("testuser");
        }

        @Test
        @DisplayName("Should throw exception when user ID not found")
        void getUserById_WhenNotExists_ShouldThrowException() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Utilisateur introuvable");
        }

        @Test
        @DisplayName("Should return user by username when exists")
        void getUserByUsername_WhenExists_ShouldReturnUser() {
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));

            User result = userService.getUserByUsername("testuser");

            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo("test@email.com");
        }
    }

    @Nested
    @DisplayName("Update Operations")
    class UpdateOperations {

        @Test
        @DisplayName("Should update user successfully")
        void updateUser_WithValidData_ShouldReturnUpdatedUser() {
            UpdateUserRequest request = new UpdateUserRequest();
            request.setUsername("newname");
            request.setEmail("new@email.com");
            request.setPassword("newpass");
            request.setRoles(Collections.singleton("admin"));

            Role adminRole = new Role(2L, ERole.ROLE_ADMIN);

            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(userRepository.existsByUsername("newname")).thenReturn(false);
            when(userRepository.existsByEmail("new@email.com")).thenReturn(false);
            when(passwordEncoder.encode("newpass")).thenReturn("newEncodedPass");
            when(roleRepository.findByName(ERole.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User updatedUser = userService.updateUser(1L, request);

            assertThat(updatedUser.getUsername()).isEqualTo("newname");
            assertThat(updatedUser.getEmail()).isEqualTo("new@email.com");
            assertThat(updatedUser.getPassword()).isEqualTo("newEncodedPass");
            assertThat(updatedUser.getRoles()).contains(adminRole);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw error if username already taken")
        void updateUser_UsernameTaken_ShouldThrowException() {
            UpdateUserRequest request = new UpdateUserRequest();
            request.setUsername("taken");

            when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(userRepository.existsByUsername("taken")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(1L, request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("username est déjà pris");
        }
    }

    @Nested
    @DisplayName("Delete Operations")
    class DeleteOperations {

        @Test
        @DisplayName("Should delete user when exists")
        void deleteUser_WhenExists_ShouldCallDelete() {
            when(userRepository.existsById(1L)).thenReturn(true);

            userService.deleteUser(1L);

            verify(userRepository, times(1)).deleteById(1L);
        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent user")
        void deleteUser_WhenNotExists_ShouldThrowException() {
            when(userRepository.existsById(1L)).thenReturn(false);

            assertThatThrownBy(() -> userService.deleteUser(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Utilisateur introuvable");
            
            verify(userRepository, never()).deleteById(any());
        }
    }
}
