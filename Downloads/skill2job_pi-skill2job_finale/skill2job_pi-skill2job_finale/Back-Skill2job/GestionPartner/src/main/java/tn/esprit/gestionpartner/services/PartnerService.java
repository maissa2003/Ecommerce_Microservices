package tn.esprit.gestionpartner.services;

import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.entities.PartnerStatus;

import java.util.List;

public interface PartnerService {

    // EMPLOYER (connecté)
    PartnerResponse createMyPartner(String username, PartnerCreateRequest request);
    PartnerResponse getMyPartner(String username);
    PartnerResponse updateMyPartner(String username, PartnerUpdateRequest request);
    void deleteMyPartner(String username);

    // ADMIN
    PartnerResponse updateStatus(Long partnerId, PartnerStatus status);
    List<PartnerResponse> getAllPartners();
    void adminDeletePartner(Long partnerId);
    PartnerResponse getPartnerById(Long partnerId);
}