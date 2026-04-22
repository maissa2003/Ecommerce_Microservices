package tn.esprit.gestionpartner.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PartnerDashboardResponse {

    // KPIs
    private long totalOffers;
    private long openOffers;
    private long closedOffers;

    private long totalApplications;
    private Map<String, Long> applicationsByStatus;

    private long interviewsScheduled; // status INTERVIEW
    private long upcomingInterviewsCount;

    // Lists
    private List<RecentApplicationItem> recentApplications;
    private List<UpcomingInterviewItem> upcomingInterviews;
    private List<TopOfferItem> topOffers;

    // Optional: deadlines soon (offers expiring soon)
    private long offersExpiringSoonCount;

    private double shortlistedRate;
    private double acceptanceRate;
    private double avgScore;
    private List<TopCandidateItem> topCandidates;

    public double getShortlistedRate() { return shortlistedRate; }
    public void setShortlistedRate(double shortlistedRate) { this.shortlistedRate = shortlistedRate; }

    public double getAcceptanceRate() { return acceptanceRate; }
    public void setAcceptanceRate(double acceptanceRate) { this.acceptanceRate = acceptanceRate; }

    public double getAvgScore() { return avgScore; }
    public void setAvgScore(double avgScore) { this.avgScore = avgScore; }

    public List<TopCandidateItem> getTopCandidates() { return topCandidates; }
    public void setTopCandidates(List<TopCandidateItem> topCandidates) { this.topCandidates = topCandidates; }

    // ===== Nested DTOs =====
    public static class TopCandidateItem {
        public Long applicationId;
        public Long offerId;
        public String offerTitle;
        public String studentUsername;
        public String studentEmail;
        public Integer score;
        public String status;
        public LocalDateTime appliedAt;
    }
    public static class RecentApplicationItem {
        public Long applicationId;
        public String status;
        public LocalDateTime appliedAt;

        public Long offerId;
        public String offerTitle;

        public String studentUsername;
        public String studentEmail;

        public String cvUrl;
        public String motivation; // could be pdf url
        public Integer score;
    }

    public static class UpcomingInterviewItem {
        public Long applicationId;
        public LocalDateTime interviewAt;
        public String meetLink;
        public String note;

        public Long offerId;
        public String offerTitle;

        public String studentUsername;
        public String studentEmail;
    }

    public static class TopOfferItem {
        public Long offerId;
        public String offerTitle;
        public String status;
        public LocalDate deadline;
        public long applicationsCount;
    }

    // ===== Getters/Setters =====
    public long getTotalOffers() { return totalOffers; }
    public void setTotalOffers(long totalOffers) { this.totalOffers = totalOffers; }

    public long getOpenOffers() { return openOffers; }
    public void setOpenOffers(long openOffers) { this.openOffers = openOffers; }

    public long getClosedOffers() { return closedOffers; }
    public void setClosedOffers(long closedOffers) { this.closedOffers = closedOffers; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public Map<String, Long> getApplicationsByStatus() { return applicationsByStatus; }
    public void setApplicationsByStatus(Map<String, Long> applicationsByStatus) { this.applicationsByStatus = applicationsByStatus; }

    public long getInterviewsScheduled() { return interviewsScheduled; }
    public void setInterviewsScheduled(long interviewsScheduled) { this.interviewsScheduled = interviewsScheduled; }

    public long getUpcomingInterviewsCount() { return upcomingInterviewsCount; }
    public void setUpcomingInterviewsCount(long upcomingInterviewsCount) { this.upcomingInterviewsCount = upcomingInterviewsCount; }

    public List<RecentApplicationItem> getRecentApplications() { return recentApplications; }
    public void setRecentApplications(List<RecentApplicationItem> recentApplications) { this.recentApplications = recentApplications; }

    public List<UpcomingInterviewItem> getUpcomingInterviews() { return upcomingInterviews; }
    public void setUpcomingInterviews(List<UpcomingInterviewItem> upcomingInterviews) { this.upcomingInterviews = upcomingInterviews; }

    public List<TopOfferItem> getTopOffers() { return topOffers; }
    public void setTopOffers(List<TopOfferItem> topOffers) { this.topOffers = topOffers; }

    public long getOffersExpiringSoonCount() { return offersExpiringSoonCount; }
    public void setOffersExpiringSoonCount(long offersExpiringSoonCount) { this.offersExpiringSoonCount = offersExpiringSoonCount; }
}