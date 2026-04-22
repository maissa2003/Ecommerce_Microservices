package org.example.recruitment.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.recruitment.Repositories.TrainerApplicationRepository;
import org.example.recruitment.Repositories.TrainerDetailsRepository;
import org.example.recruitment.Repositories.TrainerProfileRepository;
import org.example.recruitment.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrainerApplicationService Unit Tests")
class TrainerApplicationServiceTest {

    @Mock
    private TrainerApplicationRepository trainerApplicationRepository;

    @Mock
    private TrainerDetailsRepository trainerDetailsRepository;

    @Mock
    private TrainerProfileRepository trainerProfileRepository;

    @InjectMocks
    private TrainerApplicationService trainerApplicationService;

    private TrainerApplication sampleApplication;

    @BeforeEach
    void setUp() {
        sampleApplication = new TrainerApplication();
        sampleApplication.setId(1L);
        sampleApplication.setUserId(10L);
        sampleApplication.setMotivation("I want to teach Java and Spring Boot.");
        sampleApplication.setCvUrl("http://cv.com/jane.pdf");
        sampleApplication.setStatus(ApplicationStatus.PENDING);
    }

    @Test
    @DisplayName("Should submit new application successfully")
    void submit_NewApplication_ShouldReturnSaved() {
        when(trainerApplicationRepository.findByUserId(10L)).thenReturn(Optional.empty());
        when(trainerApplicationRepository.save(any(TrainerApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerApplication result = trainerApplicationService.submit(sampleApplication);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.PENDING);
        verify(trainerApplicationRepository).save(any(TrainerApplication.class));
    }

    @Test
    @DisplayName("Should update application successfully when PENDING")
    void updateApplication_WhenPending_ShouldSucceed() {
        TrainerApplication updated = new TrainerApplication();
        updated.setMotivation("Updated motivation");

        when(trainerApplicationRepository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(trainerApplicationRepository.save(any(TrainerApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerApplication result = trainerApplicationService.updateApplication(1L, updated);

        assertThat(result.getMotivation()).isEqualTo("Updated motivation");
    }

    @Test
    @DisplayName("Should throw error if updating application not in PENDING status")
    void updateApplication_WhenNotPending_ShouldThrowException() {
        sampleApplication.setStatus(ApplicationStatus.ACCEPTED);
        when(trainerApplicationRepository.findById(1L)).thenReturn(Optional.of(sampleApplication));

        assertThatThrownBy(() -> trainerApplicationService.updateApplication(1L, new TrainerApplication()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("only while status is PENDING");
    }

    @Test
    @DisplayName("Should analyze application and generate details with skills")
    void analyzeApplication_ShouldGenerateSkills() {
        when(trainerApplicationRepository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(trainerDetailsRepository.findByApplication_Id(1L)).thenReturn(Optional.empty());
        when(trainerDetailsRepository.save(any(TrainerDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerDetails details = trainerApplicationService.analyzeApplication(1L);

        assertThat(details.getSkills()).contains("Java", "Spring Boot");
        assertThat(details.getLevel()).isEqualTo("JUNIOR"); // Based on short text
        verify(trainerDetailsRepository).save(any(TrainerDetails.class));
    }

    @Test
    @DisplayName("Should accept application and create trainer profile")
    void decide_Accept_ShouldCreateProfile() {
        TrainerDetails details = TrainerDetails.builder()
                .level("SENIOR")
                .skills("Java, Spring Boot, Microservices")
                .build();

        when(trainerApplicationRepository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(trainerDetailsRepository.findByApplication_Id(1L)).thenReturn(Optional.of(details));
        when(trainerProfileRepository.existsByUserId(10L)).thenReturn(false);
        when(trainerApplicationRepository.save(any(TrainerApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerApplication result = trainerApplicationService.decide(1L, AdminDecision.ACCEPT);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.ACCEPTED);
        verify(trainerProfileRepository).save(any(TrainerProfile.class));
    }
}
