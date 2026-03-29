package com.brainhive.modules.peerhelp.dto;

import com.brainhive.modules.peerhelp.model.SessionRating;
import java.time.LocalDateTime;

/**
 * DTO for session rating responses.
 */
public class RatingResponseDTO {

    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String tutorName;
    private Integer rating;
    private Integer knowledgeRating;
    private Integer communicationRating;
    private Integer punctualityRating;
    private String feedback;
    private Boolean wouldRecommend;
    private LocalDateTime createdAt;

    // Default constructor
    public RatingResponseDTO() {}

    // Constructor from entity
    public static RatingResponseDTO fromEntity(SessionRating rating) {
        RatingResponseDTO dto = new RatingResponseDTO();
        dto.setId(rating.getId());
        dto.setSessionId(rating.getSession().getId());
        dto.setStudentId(rating.getStudent().getId());
        dto.setStudentName(rating.getStudent().getFullName());
        dto.setTutorId(rating.getTutor().getId());
        dto.setTutorName(rating.getTutor().getFullName());
        dto.setRating(rating.getRating());
        dto.setKnowledgeRating(rating.getKnowledgeRating());
        dto.setCommunicationRating(rating.getCommunicationRating());
        dto.setPunctualityRating(rating.getPunctualityRating());
        dto.setFeedback(rating.getFeedback());
        dto.setWouldRecommend(rating.getWouldRecommend());
        dto.setCreatedAt(rating.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
