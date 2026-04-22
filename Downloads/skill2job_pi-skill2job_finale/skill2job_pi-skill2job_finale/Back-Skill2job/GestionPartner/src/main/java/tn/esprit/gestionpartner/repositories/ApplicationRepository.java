package tn.esprit.gestionpartner.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.gestionpartner.entities.*;

import java.time.LocalDateTime;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndJobOfferId(Long studentId, Long offerId);

    List<Application> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    List<Application> findByJobOfferIdOrderByAppliedAtDesc(Long offerId);

    // ✅ Option pro : récupérer candidatures d’un partner via jobOffer.partner.id
    @Query("select a from Application a where a.jobOffer.partner.id = :partnerId order by a.appliedAt desc")
    List<Application> findByPartnerId(Long partnerId);


    long countByJobOfferPartnerId(Long partnerId);
    long countByJobOfferPartnerIdAndStatus(Long partnerId, ApplicationStatus status);

    List<Application> findTop10ByJobOfferPartnerIdOrderByAppliedAtDesc(Long partnerId);

    List<Application> findTop10ByJobOfferPartnerIdAndStatusOrderByInterviewAtAsc(Long partnerId, ApplicationStatus status);

    long countByJobOfferPartnerIdAndStatusAndInterviewAtAfter(Long partnerId, ApplicationStatus status, LocalDateTime now);
    @Query("select avg(a.score) from Application a where a.jobOffer.partner.id = :partnerId and a.score is not null")
    Double avgScoreByPartnerId(@Param("partnerId") Long partnerId);

    List<Application> findTop5ByJobOfferPartnerIdOrderByScoreDescAppliedAtDesc(Long partnerId);
}
