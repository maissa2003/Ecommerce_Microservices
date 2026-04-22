package tn.esprit.gestionpartner.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import tn.esprit.gestionpartner.dto.JobOfferCreateRequest;
import tn.esprit.gestionpartner.dto.JobOfferResponse;
import tn.esprit.gestionpartner.dto.JobOfferUpdateRequest;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.JobOfferRepository;
import tn.esprit.gestionpartner.repositories.PartnerRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JobOfferServiceImpl Unit Tests")
class JobOfferServiceImplTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private PartnerRepository partnerRepository;

    @InjectMocks
    private JobOfferServiceImpl jobOfferService;

    private Partner samplePartner;
    private JobOffer sampleOffer;

    @BeforeEach
    void setUp() {
        samplePartner = new Partner();
        ReflectionTestUtils.setField(samplePartner, "id", 10L);
        samplePartner.setCompanyName("Dream Team");

        sampleOffer = new JobOffer();
        ReflectionTestUtils.setField(sampleOffer, "id", 1L);
        sampleOffer.setPartner(samplePartner);
        sampleOffer.setTitle("Java Developer");
        sampleOffer.setDescription("Join our team");
        sampleOffer.setType(OfferType.JOB);
        sampleOffer.setMode(WorkMode.REMOTE);
    }

    @Test
    @DisplayName("Should create job offer successfully")
    void create_WithValidData_ShouldReturnResponse() {
        JobOfferCreateRequest request = new JobOfferCreateRequest();
        request.setPartnerId(10L);
        request.setTitle("Java Developer");
        request.setType("JOB");
        request.setMode("REMOTE");

        when(partnerRepository.findById(10L)).thenReturn(Optional.of(samplePartner));
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(sampleOffer);

        JobOfferResponse response = jobOfferService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Java Developer");
        verify(jobOfferRepository).save(any(JobOffer.class));
    }

    @Test
    @DisplayName("Should list offers by partner")
    void listByPartner_ShouldReturnList() {
        when(jobOfferRepository.findByPartner_Id(10L)).thenReturn(Arrays.asList(sampleOffer));

        List<JobOfferResponse> response = jobOfferService.listByPartner(10L);

        assertThat(response).hasSize(1);
        verify(jobOfferRepository).findByPartner_Id(10L);
    }

    @Test
    @DisplayName("Should delete job offer")
    void delete_WhenExists_ShouldCallDelete() {
        when(jobOfferRepository.existsById(1L)).thenReturn(true);

        jobOfferService.delete(1L);

        verify(jobOfferRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when offer not found during update")
    void update_NotFound_ShouldThrowException() {
        JobOfferUpdateRequest request = new JobOfferUpdateRequest();
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobOfferService.update(1L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Offer not found");
    }

    @Test
    @DisplayName("Should return offer title correctly")
    void getOfferTitle_ShouldReturnString() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleOffer));

        String title = jobOfferService.getOfferTitle(1L);

        assertThat(title).isEqualTo("Java Developer");
    }
}