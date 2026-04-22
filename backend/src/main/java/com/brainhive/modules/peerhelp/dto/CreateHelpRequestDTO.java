package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new help request.
 */
public class CreateHelpRequestDTO {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Topic is required")
    @Size(min = 3, max = 200, message = "Topic must be between 3 and 200 characters")
    private String topic;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @Min(value = 1, message = "Urgency level must be between 1 and 5")
    @Max(value = 5, message = "Urgency level must be between 1 and 5")
    private Integer urgencyLevel;

    @Future(message = "Preferred date time must be in the future")
    private LocalDateTime preferredDateTime;

    @Min(value = 15, message = "Estimated duration must be at least 15 minutes")
    @Max(value = 180, message = "Estimated duration cannot exceed 180 minutes")
    private Integer estimatedDuration;

    private Long preferredTutorId;

    // Getters and Setters
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(Integer urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public LocalDateTime getPreferredDateTime() { return preferredDateTime; }
    public void setPreferredDateTime(LocalDateTime preferredDateTime) { this.preferredDateTime = preferredDateTime; }

    public Integer getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public Long getPreferredTutorId() { return preferredTutorId; }
    public void setPreferredTutorId(Long preferredTutorId) { this.preferredTutorId = preferredTutorId; }
}
