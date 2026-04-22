package tn.esprit.gestionpartner.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import tn.esprit.gestionpartner.entities.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;

    private Long offerId;
    private String offerTitle;
    private String location;

    private Long partnerId;
    private String partnerName;

    // ✅ student
    private String studentUsername;
    private String studentEmail;

    // ✅ files
    private String cvUrl;
    private String motivation;
    // ✅ NEW
    private Integer score;

    private boolean autoShortlisted;
    // ✅ interview
    private LocalDateTime interviewAt;

    @JsonProperty("meetLink")
    private String interviewMeetLink;

    private String interviewNote;



    public ApplicationResponse(Long id,
                               ApplicationStatus status,
                               LocalDateTime appliedAt,
                               Long offerId,
                               String offerTitle,
                               String location,
                               Long partnerId,
                               String partnerName,
                               String studentUsername,
                               String studentEmail,
                               String cvUrl,
                               String motivation,
                               Integer score,
                               boolean autoShortlisted,
                               LocalDateTime interviewAt,
                               String interviewMeetLink,
                               String interviewNote) {
        this.id = id;
        this.status = status;
        this.appliedAt = appliedAt;
        this.offerId = offerId;
        this.offerTitle = offerTitle;
        this.location = location;
        this.partnerId = partnerId;
        this.partnerName = partnerName;
        this.studentUsername = studentUsername;
        this.studentEmail = studentEmail;
        this.cvUrl = cvUrl;
        this.motivation = motivation;
        this.score = score;
        this.autoShortlisted = autoShortlisted;
        this.interviewAt = interviewAt;
        this.interviewMeetLink = interviewMeetLink;
        this.interviewNote = interviewNote;
    }

    public Long getId() { return id; }
    public ApplicationStatus getStatus() { return status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }

    public Long getOfferId() { return offerId; }
    public String getOfferTitle() { return offerTitle; }
    public String getLocation() { return location; }

    public Long getPartnerId() { return partnerId; }
    public String getPartnerName() { return partnerName; }

    public String getStudentUsername() { return studentUsername; }
    public String getStudentEmail() { return studentEmail; }

    public String getCvUrl() { return cvUrl; }
    public String getMotivation() { return motivation; }
    public Integer getScore() { return score; }
    public boolean isAutoShortlisted() { return autoShortlisted; }
    public LocalDateTime getInterviewAt() { return interviewAt; }

    @JsonProperty("meetLink")
    public String getInterviewMeetLink() { return interviewMeetLink; }
    public String getInterviewNote() { return interviewNote; }
}