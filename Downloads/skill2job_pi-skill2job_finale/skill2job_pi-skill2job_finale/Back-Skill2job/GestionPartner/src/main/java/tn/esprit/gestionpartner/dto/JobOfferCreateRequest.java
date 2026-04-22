package tn.esprit.gestionpartner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class JobOfferCreateRequest {

    @NotNull
    private Long partnerId;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String location;

    @NotBlank
    private String type;   // INTERNSHIP / JOB

    @NotBlank
    private String mode;   // ONSITE / REMOTE / HYBRID

    private String requirements;
    private String deadline; // yyyy-MM-dd

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
}
