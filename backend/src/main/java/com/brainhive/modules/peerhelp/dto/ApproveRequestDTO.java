package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for approving a help request and creating a session.
 */
public class ApproveRequestDTO {

    @NotNull(message = "Scheduled start time is required")
    @Future(message = "Scheduled start time must be in the future")
    private LocalDateTime scheduledStartTime;

    @NotNull(message = "Scheduled end time is required")
    @Future(message = "Scheduled end time must be in the future")
    private LocalDateTime scheduledEndTime;

    @Size(max = 500, message = "Meeting link cannot exceed 500 characters")
    private String meetingLink;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    // Getters and Setters
    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public LocalDateTime getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
