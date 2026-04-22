package tn.esprit.gestionpartner.services;

import tn.esprit.gestionpartner.dto.JobOfferCreateRequest;
import tn.esprit.gestionpartner.dto.JobOfferResponse;
import tn.esprit.gestionpartner.dto.JobOfferUpdateRequest;
import tn.esprit.gestionpartner.entities.OfferStatus;

import java.util.List;

public interface JobOfferService {
    JobOfferResponse create(JobOfferCreateRequest request);
    JobOfferResponse update(Long offerId, JobOfferUpdateRequest request);
    JobOfferResponse getById(Long offerId);
    List<JobOfferResponse> listAll();
    List<JobOfferResponse> listByPartner(Long partnerId);
    void delete(Long offerId);
    JobOfferResponse updateStatus(Long offerId, OfferStatus status);
    String getOfferTitle(Long id);
}
