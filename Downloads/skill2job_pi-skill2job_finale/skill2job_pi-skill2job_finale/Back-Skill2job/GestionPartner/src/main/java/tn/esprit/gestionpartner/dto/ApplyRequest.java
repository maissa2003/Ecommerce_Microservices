package tn.esprit.gestionpartner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApplyRequest {

    @NotNull
    private Long jobOfferId;

    @NotBlank
    private String motivation;

    private String cvUrl;

    public Long getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(Long jobOfferId) { this.jobOfferId = jobOfferId; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
}