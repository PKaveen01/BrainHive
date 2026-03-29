package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.HelpRequest;
import com.brainhive.modules.peerhelp.model.HelpRequestStatus;

/**
 * DTO for help request responses.
 */
public class HelpRequestResponseDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private String topic;
    private String description;
    private HelpRequestStatus status;
    private Integer urgencyLevel;
    private LocalDateTime preferredDateTime;
    private Integer estimatedDuration;
    private Long assignedTutorId;
    private String assignedTutorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public HelpRequestResponseDTO() {}

    // Constructor from entity
    public static HelpRequestResponseDTO fromEntity(HelpRequest helpRequest) {
        HelpRequestResponseDTO dto = new HelpRequestResponseDTO();
        dto.setId(helpRequest.getId());
        dto.setStudentId(helpRequest.getStudent().getId());
        dto.setStudentName(helpRequest.getStudent().getFullName());
        dto.setSubjectId(helpRequest.getSubject().getId());
        dto.setSubjectName(helpRequest.getSubject().getName());
        dto.setTopic(helpRequest.getTopic());
        dto.setDescription(helpRequest.getDescription());
        dto.setStatus(helpRequest.getStatus());
        dto.setUrgencyLevel(helpRequest.getUrgencyLevel());
        dto.setPreferredDateTime(helpRequest.getPreferredDateTime());
        dto.setEstimatedDuration(helpRequest.getEstimatedDuration());
        if (helpRequest.getAssignedTutor() != null) {
            dto.setAssignedTutorId(helpRequest.getAssignedTutor().getId());
            dto.setAssignedTutorName(helpRequest.getAssignedTutor().getFullName());
        }
        dto.setCreatedAt(helpRequest.getCreatedAt());
        dto.setUpdatedAt(helpRequest.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public HelpRequestStatus getStatus() { return status; }
    public void setStatus(HelpRequestStatus status) { this.status = status; }

    public Integer getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(Integer urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public LocalDateTime getPreferredDateTime() { return preferredDateTime; }
    public void setPreferredDateTime(LocalDateTime preferredDateTime) { this.preferredDateTime = preferredDateTime; }

    public Integer getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public Long getAssignedTutorId() { return assignedTutorId; }
    public void setAssignedTutorId(Long assignedTutorId) { this.assignedTutorId = assignedTutorId; }

    public String getAssignedTutorName() { return assignedTutorName; }
    public void setAssignedTutorName(String assignedTutorName) { this.assignedTutorName = assignedTutorName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
