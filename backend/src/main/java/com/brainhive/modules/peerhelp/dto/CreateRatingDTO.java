package com.brainhive.modules.peerhelp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a session rating.
 */
public class CreateRatingDTO {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Min(value = 1, message = "Knowledge rating must be between 1 and 5")
    @Max(value = 5, message = "Knowledge rating must be between 1 and 5")
    private Integer knowledgeRating;

    @Min(value = 1, message = "Communication rating must be between 1 and 5")
    @Max(value = 5, message = "Communication rating must be between 1 and 5")
    private Integer communicationRating;

    @Min(value = 1, message = "Punctuality rating must be between 1 and 5")
    @Max(value = 5, message = "Punctuality rating must be between 1 and 5")
    private Integer punctualityRating;

    @Size(max = 1000, message = "Feedback cannot exceed 1000 characters")
    private String feedback;

    private Boolean wouldRecommend = true;

    // Getters and Setters
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getKnowledgeRating() { return knowledgeRating; }
    public void setKnowledgeRating(Integer knowledgeRating) { this.knowledgeRating = knowledgeRating; }

    public Integer getCommunicationRating() { return communicationRating; }
    public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }

    public Integer getPunctualityRating() { return punctualityRating; }
    public void setPunctualityRating(Integer punctualityRating) { this.punctualityRating = punctualityRating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Boolean getWouldRecommend() { return wouldRecommend; }
    public void setWouldRecommend(Boolean wouldRecommend) { this.wouldRecommend = wouldRecommend; }
}
