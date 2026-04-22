package tn.esprit.gestionpartner.dto;

import jakarta.validation.constraints.NotNull;
import tn.esprit.gestionpartner.entities.ApplicationStatus;

public class UpdateApplicationStatusRequest {

    @NotNull
    private ApplicationStatus status;

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}