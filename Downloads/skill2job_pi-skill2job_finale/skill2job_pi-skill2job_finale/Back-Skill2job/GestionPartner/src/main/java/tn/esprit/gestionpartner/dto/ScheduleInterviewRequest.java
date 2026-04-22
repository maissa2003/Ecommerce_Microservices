package tn.esprit.gestionpartner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ScheduleInterviewRequest {

    @NotNull
    private LocalDateTime interviewAt;

    @NotBlank
    private String meetLink;

    private String note; // optionnel

    public LocalDateTime getInterviewAt() { return interviewAt; }
    public void setInterviewAt(LocalDateTime interviewAt) { this.interviewAt = interviewAt; }

    public String getMeetLink() { return meetLink; }
    public void setMeetLink(String meetLink) { this.meetLink = meetLink; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}