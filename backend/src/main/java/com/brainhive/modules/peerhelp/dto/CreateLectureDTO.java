package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateLectureDTO {

    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotBlank(message = "Lecture title is required")
    @Size(min = 3, max = 200, message = "Lecture title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Lecture description is required")
    @Size(min = 10, max = 2000, message = "Lecture description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Lecture date and time is required")
    @Future(message = "Lecture date and time must be in the future")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 240, message = "Duration cannot exceed 240 minutes")
    private Integer durationMinutes;

    @Size(max = 500, message = "Meeting link cannot exceed 500 characters")
    private String meetingLink;

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
}
