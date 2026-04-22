package tn.esprit.gestionpartner.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.Partner;
import tn.esprit.gestionpartner.entities.PartnerStatus;
import tn.esprit.gestionpartner.repositories.PartnerRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartnerServiceImpl Unit Tests")
class PartnerServiceImplTest {

    @Mock
    private PartnerRepository partnerRepository;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private PartnerServiceImpl partnerService;

    private UserDTO sampleUser;
    private Partner samplePartner;

    @BeforeEach
    void setUp() {
        sampleUser = new UserDTO();
        sampleUser.setId(1L);
        sampleUser.setUsername("employer1");

        samplePartner = new Partner();
        samplePartner.setId(1L);
        samplePartner.setEmployerId(1L);
        samplePartner.setCompanyName("Tech Corp");
        samplePartner.setStatus(PartnerStatus.PENDING);
    }

    @Test
    @DisplayName("Should create partner profile successfully")
    void createMyPartner_ShouldReturnResponse() {
        PartnerCreateRequest request = new PartnerCreateRequest();
        request.setCompanyName("Tech Corp");

        when(userClient.getUserByUsername("employer1")).thenReturn(sampleUser);
        when(partnerRepository.existsByEmployerId(1L)).thenReturn(false);
        when(partnerRepository.save(any(Partner.class))).thenReturn(samplePartner);

        PartnerResponse response = partnerService.createMyPartner("employer1", request);

        assertThat(response).isNotNull();
        assertThat(response.getCompanyName()).isEqualTo("Tech Corp");
        verify(partnerRepository).save(any(Partner.class));
    }

    @Test
    @DisplayName("Should throw error if partner profile already exists for employer")
    void createMyPartner_AlreadyExists_ShouldThrowException() {
        PartnerCreateRequest request = new PartnerCreateRequest();
        when(userClient.getUserByUsername("employer1")).thenReturn(sampleUser);
        when(partnerRepository.existsByEmployerId(1L)).thenReturn(true);

        assertThatThrownBy(() -> partnerService.createMyPartner("employer1", request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should get my partner profile")
    void getMyPartner_ShouldReturnResponse() {
        when(userClient.getUserByUsername("employer1")).thenReturn(sampleUser);
        when(partnerRepository.findByEmployerId(1L)).thenReturn(Optional.of(samplePartner));

        PartnerResponse response = partnerService.getMyPartner("employer1");

        assertThat(response.getCompanyName()).isEqualTo("Tech Corp");
    }

    @Test
    @DisplayName("Should update partner status (approved/rejected)")
    void updateStatus_ShouldChangeStatusAndNotifyUserClient() {
        when(partnerRepository.findById(1L)).thenReturn(Optional.of(samplePartner));
        when(partnerRepository.save(any(Partner.class))).thenReturn(samplePartner);

        PartnerResponse response = partnerService.updateStatus(1L, PartnerStatus.APPROVED);

        assertThat(response.getStatus()).isEqualTo("APPROVED");
        verify(userClient).updateUser(eq(1L), any());
        verify(partnerRepository).save(any(Partner.class));
    }

    @Test
    @DisplayName("Should delete partner profile (Admin)")
    void adminDeletePartner_ShouldDeleteAndCallUserClient() {
        when(partnerRepository.findById(1L)).thenReturn(Optional.of(samplePartner));

        partnerService.adminDeletePartner(1L);

        verify(partnerRepository).delete(samplePartner);
        verify(userClient).deleteUser(1L);
    }

    @Test
    @DisplayName("Should throw exception when partner profile not found")
    void getPartnerById_NotFound_ShouldThrowException() {
        when(partnerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> partnerService.getPartnerById(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Partner not found");
    }
}
