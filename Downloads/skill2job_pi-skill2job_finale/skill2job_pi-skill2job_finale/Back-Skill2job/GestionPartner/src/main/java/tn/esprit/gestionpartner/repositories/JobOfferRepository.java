package tn.esprit.gestionpartner.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionpartner.entities.JobOffer;
import tn.esprit.gestionpartner.entities.OfferStatus;


import java.time.LocalDate;
import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByPartnerId(Long partnerId);
    List<JobOffer> findByStatus(String status); // optional if you want string-based
    List<JobOffer> findByPartner_Id(Long partnerId);
    @Modifying
    @Query("""
    update JobOffer o
    set o.status = tn.esprit.gestionpartner.entities.OfferStatus.CLOSED
    where o.status = tn.esprit.gestionpartner.entities.OfferStatus.OPEN
      and o.deadline is not null
      and o.deadline < :today
""")
    int closeExpiredOffers(@Param("today") LocalDate today);
    long countByPartnerId(Long partnerId);
    long countByPartnerIdAndStatus(Long partnerId, OfferStatus status);

    long countByPartnerIdAndDeadlineBetween(Long partnerId, LocalDate start, LocalDate end);
}
