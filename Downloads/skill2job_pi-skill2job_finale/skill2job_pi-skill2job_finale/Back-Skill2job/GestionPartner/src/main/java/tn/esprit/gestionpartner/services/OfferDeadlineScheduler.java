package tn.esprit.gestionpartner.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.gestionpartner.repositories.JobOfferRepository;

import java.time.LocalDate;

@Service
public class OfferDeadlineScheduler {

    private final JobOfferRepository jobOfferRepository;

    public OfferDeadlineScheduler(JobOfferRepository jobOfferRepository) {
        this.jobOfferRepository = jobOfferRepository;
    }

    // Exécuté toutes les 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void closeExpiredOffers() {
        jobOfferRepository.closeExpiredOffers(LocalDate.now());
    }
}