package tn.esprit.gestionpartner.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.gestionpartner.clients.UserClient;
import tn.esprit.gestionpartner.dto.PartnerDashboardResponse;
import tn.esprit.gestionpartner.dto.UserDTO;
import tn.esprit.gestionpartner.entities.*;
import tn.esprit.gestionpartner.repositories.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PartnerDashboardService {

    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final UserClient userClient;
    private final PartnerRepository partnerRepository;

    public PartnerDashboardService(JobOfferRepository jobOfferRepository,
                                   ApplicationRepository applicationRepository,
                                   UserClient userClient,
                                   PartnerRepository partnerRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.applicationRepository = applicationRepository;
        this.userClient = userClient;
        this.partnerRepository = partnerRepository;
    }

    public PartnerDashboardResponse getDashboard() {

        UserDTO currentUser = getCurrentUser();

        // ✅ RÉCUPÉRATION CORRECTE DU PARTNER
        Partner partner = partnerRepository.findByEmployerId(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Partner profile not found for this user."
                ));

        Long partnerId = partner.getId();

        PartnerDashboardResponse res = new PartnerDashboardResponse();

        // =========================
        // OFFERS STATS
        // =========================
        long totalOffers = jobOfferRepository.countByPartnerId(partnerId);
        long openOffers = jobOfferRepository.countByPartnerIdAndStatus(partnerId, OfferStatus.OPEN);
        long closedOffers = jobOfferRepository.countByPartnerIdAndStatus(partnerId, OfferStatus.CLOSED);

        res.setTotalOffers(totalOffers);
        res.setOpenOffers(openOffers);
        res.setClosedOffers(closedOffers);

        // Offers expiring in next 7 days
        LocalDate now = LocalDate.now();
        long expSoon = jobOfferRepository.countByPartnerIdAndDeadlineBetween(
                partnerId, now, now.plusDays(7)
        );
        res.setOffersExpiringSoonCount(expSoon);

        // =========================
        // APPLICATION STATS
        // =========================
        long totalApps = applicationRepository.countByJobOfferPartnerId(partnerId);
        res.setTotalApplications(totalApps);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            byStatus.put(
                    s.name(),
                    applicationRepository.countByJobOfferPartnerIdAndStatus(partnerId, s)
            );
        }
        res.setApplicationsByStatus(byStatus);

        long interviews = applicationRepository.countByJobOfferPartnerIdAndStatus(
                partnerId, ApplicationStatus.INTERVIEW
        );
        res.setInterviewsScheduled(interviews);

        long upcoming = applicationRepository
                .countByJobOfferPartnerIdAndStatusAndInterviewAtAfter(
                        partnerId,
                        ApplicationStatus.INTERVIEW,
                        LocalDateTime.now()
                );
        res.setUpcomingInterviewsCount(upcoming);

        // =========================
        // ✅ NEW KPIs (PRO)
        // =========================
        long shortlisted = byStatus.getOrDefault(ApplicationStatus.SHORTLISTED.name(), 0L);
        long accepted = byStatus.getOrDefault(ApplicationStatus.ACCEPTED.name(), 0L);

        double shortlistedRate = totalApps == 0 ? 0 : (shortlisted * 100.0 / totalApps);
        double acceptanceRate = totalApps == 0 ? 0 : (accepted * 100.0 / totalApps);

        // round 1 decimal
        res.setShortlistedRate(Math.round(shortlistedRate * 10.0) / 10.0);
        res.setAcceptanceRate(Math.round(acceptanceRate * 10.0) / 10.0);

        Double avgScore = applicationRepository.avgScoreByPartnerId(partnerId);
        res.setAvgScore(avgScore == null ? 0 : (Math.round(avgScore * 10.0) / 10.0));

        // =========================
        // RECENT APPLICATIONS
        // =========================
        List<Application> recent =
                applicationRepository.findTop10ByJobOfferPartnerIdOrderByAppliedAtDesc(partnerId);

        List<PartnerDashboardResponse.RecentApplicationItem> recentItems =
                recent.stream().map(a -> {
                    PartnerDashboardResponse.RecentApplicationItem it =
                            new PartnerDashboardResponse.RecentApplicationItem();

                    it.applicationId = a.getId();
                    it.status = a.getStatus().name();
                    it.appliedAt = a.getAppliedAt();
                    it.offerId = a.getJobOffer().getId();
                    it.offerTitle = a.getJobOffer().getTitle();
                    // ✅ Fetch student info via Feign
                    try {
                        UserDTO student = userClient.getUserById(a.getStudentId());
                        if (student != null) {
                            it.studentUsername = student.getUsername();
                            it.studentEmail = student.getEmail();
                        }
                    } catch (Exception e) {
                        it.studentUsername = "Unknown";
                    }
                    it.cvUrl = a.getCvUrl();
                    it.motivation = a.getMotivation();
                    it.score = a.getScore();
                    return it;
                }).toList();

        res.setRecentApplications(recentItems);

        // =========================
        // UPCOMING INTERVIEWS
        // =========================
        List<Application> upcomingApps =
                applicationRepository
                        .findTop10ByJobOfferPartnerIdAndStatusOrderByInterviewAtAsc(
                                partnerId,
                                ApplicationStatus.INTERVIEW
                        );

        List<PartnerDashboardResponse.UpcomingInterviewItem> upItems =
                upcomingApps.stream()
                        .filter(a -> a.getInterviewAt() != null)
                        .map(a -> {
                            PartnerDashboardResponse.UpcomingInterviewItem it =
                                    new PartnerDashboardResponse.UpcomingInterviewItem();

                            it.applicationId = a.getId();
                            it.interviewAt = a.getInterviewAt();
                            it.meetLink = a.getInterviewMeetLink();
                            it.note = a.getInterviewNote();
                            it.offerId = a.getJobOffer().getId();
                            it.offerTitle = a.getJobOffer().getTitle();
                            // ✅ Fetch student info via Feign
                            try {
                                UserDTO student = userClient.getUserById(a.getStudentId());
                                if (student != null) {
                                    it.studentUsername = student.getUsername();
                                    it.studentEmail = student.getEmail();
                                }
                            } catch (Exception e) {
                                it.studentUsername = "Unknown";
                            }
                            return it;
                        }).toList();

        res.setUpcomingInterviews(upItems);

        // =========================
        // ✅ TOP CANDIDATES (Top 5)
        // =========================
        List<Application> top =
                applicationRepository.findTop5ByJobOfferPartnerIdOrderByScoreDescAppliedAtDesc(partnerId);

        List<PartnerDashboardResponse.TopCandidateItem> topCandidates =
                top.stream().map(a -> {
                    PartnerDashboardResponse.TopCandidateItem it =
                            new PartnerDashboardResponse.TopCandidateItem();

                    it.applicationId = a.getId();
                    it.offerId = a.getJobOffer().getId();
                    it.offerTitle = a.getJobOffer().getTitle();
                    // ✅ Fetch student info via Feign
                    try {
                        UserDTO student = userClient.getUserById(a.getStudentId());
                        if (student != null) {
                            it.studentUsername = student.getUsername();
                            it.studentEmail = student.getEmail();
                        }
                    } catch (Exception e) {
                        it.studentUsername = "Unknown";
                    }
                    it.score = a.getScore();
                    it.status = a.getStatus().name();
                    it.appliedAt = a.getAppliedAt();
                    return it;
                }).toList();

        res.setTopCandidates(topCandidates);

        return res;
    }

    private UserDTO getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }

        UserDTO user = userClient.getUserByUsername(auth.getName());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
        }
        return user;
    }
}