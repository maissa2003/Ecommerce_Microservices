package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.recruitment.Repositories.TrainerProfileRepository;
import org.example.recruitment.entities.TrainerProfile;
import org.example.recruitment.entities.TrainerProfileStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrainerProfileService Unit Tests")
class TrainerProfileServiceTest {

    @Mock
    private TrainerProfileRepository trainerProfileRepository;

    @InjectMocks
    private TrainerProfileService trainerProfileService;

    private TrainerProfile sampleProfile;

    @BeforeEach
    void setUp() {
        sampleProfile = TrainerProfile.builder()
                .id(1L)
                .userId(10L)
                .mainSpeciality("Java")
                .level("SENIOR")
                .status(TrainerProfileStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should create trainer profile successfully")
    void create_ShouldReturnSavedProfile() {
        when(trainerProfileRepository.save(any(TrainerProfile.class))).thenReturn(sampleProfile);

        TrainerProfile result = trainerProfileService.create(sampleProfile);

        assertThat(result).isNotNull();
        assertThat(result.getMainSpeciality()).isEqualTo("Java");
        verify(trainerProfileRepository).save(any(TrainerProfile.class));
    }

    @Test
    @DisplayName("Should return all trainer profiles")
    void getAll_ShouldReturnList() {
        when(trainerProfileRepository.findAll()).thenReturn(Arrays.asList(sampleProfile));

        List<TrainerProfile> result = trainerProfileService.getAll();

        assertThat(result).hasSize(1);
        verify(trainerProfileRepository).findAll();
    }

    @Test
    @DisplayName("Should return trainer profile by ID")
    void getById_WhenExists_ShouldReturnProfile() {
        when(trainerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));

        TrainerProfile result = trainerProfileService.getById(1L);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when profile not found by ID")
    void getById_NotFound_ShouldThrowException() {
        when(trainerProfileRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trainerProfileService.getById(1L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("TrainerProfile not found");
    }

    @Test
    @DisplayName("Should update trainer profile successfully")
    void update_ShouldReturnUpdatedProfile() {
        TrainerProfile incoming = new TrainerProfile();
        incoming.setMainSpeciality("Spring Boot");
        incoming.setLevel("EXPERT");

        when(trainerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(trainerProfileRepository.save(any(TrainerProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerProfile result = trainerProfileService.update(1L, incoming);

        assertThat(result.getMainSpeciality()).isEqualTo("Spring Boot");
        assertThat(result.getLevel()).isEqualTo("EXPERT");
        verify(trainerProfileRepository).save(any(TrainerProfile.class));
    }

    @Test
    @DisplayName("Should change status successfully")
    void changeStatus_ShouldUpdateStatus() {
        when(trainerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(trainerProfileRepository.save(any(TrainerProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerProfile result = trainerProfileService.changeStatus(1L, TrainerProfileStatus.SUSPENDED);

        assertThat(result.getStatus()).isEqualTo(TrainerProfileStatus.SUSPENDED);
    }

    @Test
    @DisplayName("Should delete trainer profile")
    void delete_WhenExists_ShouldCallDelete() {
        when(trainerProfileRepository.existsById(1L)).thenReturn(true);

        trainerProfileService.delete(1L);

        verify(trainerProfileRepository).deleteById(1L);
    }
}
