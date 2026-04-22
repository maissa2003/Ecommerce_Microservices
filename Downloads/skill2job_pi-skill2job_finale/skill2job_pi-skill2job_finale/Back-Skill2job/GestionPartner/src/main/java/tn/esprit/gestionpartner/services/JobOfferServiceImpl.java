package tn.esprit.gestionpartner.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.dto.JobOfferCreateRequest;
import tn.esprit.gestionpartner.dto.JobOfferResponse;
import tn.esprit.gestionpartner.dto.JobOfferUpdateRequest;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.JobOfferRepository;
import tn.esprit.gestionpartner.repositories.PartnerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobOfferServiceImpl implements JobOfferService {

    private final JobOfferRepository repo;
    private final PartnerRepository partnerRepo;

    public JobOfferServiceImpl(JobOfferRepository repo, PartnerRepository partnerRepo) {
        this.repo = repo;
        this.partnerRepo = partnerRepo;
    }

    @Override
    public JobOfferResponse create(JobOfferCreateRequest request) {

        if (request.getPartnerId() == null) {
            throw new IllegalStateException("partnerId is required.");
        }

        Partner partner = partnerRepo.findById(request.getPartnerId())
                .orElseThrow(() -> new IllegalStateException("Partner not found."));

        JobOffer offer = new JobOffer();
        offer.setPartner(partner);

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setLocation(request.getLocation());

        offer.setType(parseOfferType(request.getType()));
        offer.setMode(parseWorkMode(request.getMode()));

        offer.setRequirements(request.getRequirements());

        if (request.getDeadline() != null && !request.getDeadline().isBlank()) {
            offer.setDeadline(LocalDate.parse(request.getDeadline()));
        }

        offer.setStatus(OfferStatus.OPEN);

        return toResponse(repo.save(offer));
    }

    @Override
    public JobOfferResponse update(Long offerId, JobOfferUpdateRequest request) {

        JobOffer offer = repo.findById(offerId)
                .orElseThrow(() -> new IllegalStateException("Offer not found."));

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setLocation(request.getLocation());

        offer.setType(parseOfferType(request.getType()));
        offer.setMode(parseWorkMode(request.getMode()));

        offer.setRequirements(request.getRequirements());

        if (request.getDeadline() != null && !request.getDeadline().isBlank()) {
            offer.setDeadline(LocalDate.parse(request.getDeadline()));
        } else {
            offer.setDeadline(null);
        }

        return toResponse(offer); // managed entity, pas besoin de save()
    }

    @Override
    @Transactional(readOnly = true)
    public JobOfferResponse getById(Long offerId) {
        JobOffer offer = repo.findById(offerId)
                .orElseThrow(() -> new IllegalStateException("Offer not found."));
        return toResponse(offer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobOfferResponse> listAll() {
        return repo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobOfferResponse> listByPartner(Long partnerId) {
        return repo.findByPartner_Id(partnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long offerId) {
        if (!repo.existsById(offerId)) {
            throw new IllegalStateException("Offer not found.");
        }
        repo.deleteById(offerId);
    }

    @Override
    public JobOfferResponse updateStatus(Long offerId, OfferStatus status) {
        JobOffer offer = repo.findById(offerId)
                .orElseThrow(() -> new IllegalStateException("Offer not found."));
        offer.setStatus(status);
        return toResponse(offer);
    }

    // =========================
    // Helpers
    // =========================
    private OfferType parseOfferType(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Offer type is required (INTERNSHIP/JOB).");
        }
        return OfferType.valueOf(value.trim().toUpperCase());
    }

    private WorkMode parseWorkMode(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Work mode is required (ONSITE/REMOTE/HYBRID).");
        }
        return WorkMode.valueOf(value.trim().toUpperCase());
    }

    private JobOfferResponse toResponse(JobOffer o) {
        JobOfferResponse r = new JobOfferResponse();
        r.setId(o.getId());

        // ✅ partnerId vient de la relation
        r.setPartnerId(o.getPartner() != null ? o.getPartner().getId() : null);

        r.setTitle(o.getTitle());
        r.setDescription(o.getDescription());
        r.setLocation(o.getLocation());
        r.setType(o.getType() != null ? o.getType().name() : null);
        r.setMode(o.getMode() != null ? o.getMode().name() : null);
        r.setRequirements(o.getRequirements());
        r.setDeadline(o.getDeadline() != null ? o.getDeadline().toString() : null);
        r.setStatus(o.getStatus() != null ? o.getStatus().name() : null);
        r.setCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
        r.setUpdatedAt(o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : null);
        return r;
    }
    @Override
    public String getOfferTitle(Long id) {

        JobOffer offer = repo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Offer not found"
                        ));

        return offer.getTitle();
    }

}
