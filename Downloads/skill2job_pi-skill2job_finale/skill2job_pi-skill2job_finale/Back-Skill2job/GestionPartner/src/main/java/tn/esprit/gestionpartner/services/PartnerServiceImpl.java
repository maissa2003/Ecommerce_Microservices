package tn.esprit.gestionpartner.services;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.PartnerCreateRequest;
import tn.esprit.gestionpartner.dto.PartnerResponse;
import tn.esprit.gestionpartner.dto.PartnerUpdateRequest;
import tn.esprit.gestionpartner.dto.UpdateUserRequest;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.PartnerRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;
    private final UserClient userClient;

    public PartnerServiceImpl(PartnerRepository partnerRepository,
                              UserClient userClient) {
        this.partnerRepository = partnerRepository;
        this.userClient = userClient;
    }

    @Override
    public PartnerResponse createMyPartner(String username, PartnerCreateRequest request) {

        UserDTO employer = userClient.getUserByUsername(username);
        if (employer == null) {
            throw new EntityNotFoundException("Utilisateur introuvable : " + username);
        }

        if (partnerRepository.existsByEmployerId(employer.getId())) {
            throw new IllegalStateException("Partner profile already exists for this employer.");
        }

        Partner partner = new Partner();
        partner.setEmployerId(employer.getId());
        partner.setCompanyName(request.getCompanyName());
        partner.setIndustry(request.getIndustry());
        partner.setCompanyEmail(request.getCompanyEmail());
        partner.setPhone(request.getPhone());
        partner.setAddress(request.getAddress());
        partner.setWebsite(request.getWebsite());
        partner.setDescription(request.getDescription());
        partner.setStatus(PartnerStatus.PENDING);

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerResponse getMyPartner(String username) {
        UserDTO employer = userClient.getUserByUsername(username);
        if (employer == null) {
            throw new EntityNotFoundException("Utilisateur introuvable : " + username);
        }

        Partner partner = partnerRepository.findByEmployerId(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        return toResponse(partner);
    }

    @Override
    public PartnerResponse updateMyPartner(String username, PartnerUpdateRequest request) {
        UserDTO employer = userClient.getUserByUsername(username);
        if (employer == null) {
            throw new EntityNotFoundException("Utilisateur introuvable : " + username);
        }

        Partner partner = partnerRepository.findByEmployerId(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        partner.setCompanyName(request.getCompanyName());
        partner.setIndustry(request.getIndustry());
        partner.setCompanyEmail(request.getCompanyEmail());
        partner.setPhone(request.getPhone());
        partner.setAddress(request.getAddress());
        partner.setWebsite(request.getWebsite());
        partner.setDescription(request.getDescription());

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    public void deleteMyPartner(String username) {
        UserDTO employer = userClient.getUserByUsername(username);
        if (employer == null) {
            throw new EntityNotFoundException("Utilisateur introuvable : " + username);
        }

        Partner partner = partnerRepository.findByEmployerId(employer.getId())
                .orElseThrow(() -> new IllegalStateException("Partner profile not found."));

        partnerRepository.delete(partner);
    }

    // ADMIN
    @Override
    public PartnerResponse updateStatus(Long partnerId, PartnerStatus status) {

        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));

        partner.setStatus(status);

        if (status == PartnerStatus.APPROVED) {
             UpdateUserRequest updateRequest = new UpdateUserRequest();
             updateRequest.setRoles(java.util.Set.of("partner")); // Resolves to ROLE_PARTNER in GestionUser
             userClient.updateUser(partner.getEmployerId(), updateRequest);
        }

        Partner saved = partnerRepository.save(partner);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartnerResponse> getAllPartners() {
        return partnerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void adminDeletePartner(Long partnerId) {
 
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
 
        Long employerId = partner.getEmployerId();
 
        // ✅ 1) supprimer le partner (pour éviter contrainte FK)
        partnerRepository.delete(partner);
        partnerRepository.flush(); // ✅ important
 
        // ✅ 2) supprimer le user via Feign
        if (employerId != null) {
            userClient.deleteUser(employerId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerResponse getPartnerById(Long partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalStateException("Partner not found."));
        return toResponse(partner);
    }

    private PartnerResponse toResponse(Partner p) {
        PartnerResponse res = new PartnerResponse();
        res.setId(p.getId());
        res.setEmployerId(p.getEmployerId());
        res.setCompanyName(p.getCompanyName());
        res.setIndustry(p.getIndustry());
        res.setCompanyEmail(p.getCompanyEmail());
        res.setPhone(p.getPhone());
        res.setAddress(p.getAddress());
        res.setWebsite(p.getWebsite());
        res.setDescription(p.getDescription());
        res.setStatus(p.getStatus().name());
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());
        return res;
    }
}