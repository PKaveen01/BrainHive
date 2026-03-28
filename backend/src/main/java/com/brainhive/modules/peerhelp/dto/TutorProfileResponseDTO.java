package com.brainhive.modules.peerhelp.dto;

import com.brainhive.modules.peerhelp.model.TutorProfile;

/**
 * DTO for tutor profile responses.
 */
public class TutorProfileResponseDTO {

    private Long id;
    private Long tutorId;
    private String tutorName;
    private String tutorEmail;
    private Long subjectId;
    private String subjectName;
    private Integer proficiencyLevel;
    private Integer totalSessions;
    private Double averageRating;
    private Double credibilityScore;
    private String bio;
    private Double hourlyRate;
    private Boolean isAvailable;

    // Default constructor
    public TutorProfileResponseDTO() {}

    // Constructor from entity
    public static TutorProfileResponseDTO fromEntity(TutorProfile profile) {
        TutorProfileResponseDTO dto = new TutorProfileResponseDTO();
        dto.setId(profile.getId());
        dto.setTutorId(profile.getTutor().getId());
        dto.setTutorName(profile.getTutor().getFullName());
        dto.setTutorEmail(profile.getTutor().getEmail());
        dto.setSubjectId(profile.getSubject().getId());
        dto.setSubjectName(profile.getSubject().getName());
        dto.setProficiencyLevel(profile.getProficiencyLevel());
        dto.setTotalSessions(profile.getTotalSessions());
        dto.setAverageRating(profile.getAverageRating());
        dto.setCredibilityScore(profile.getCredibilityScore());
        dto.setBio(profile.getBio());
        dto.setHourlyRate(profile.getHourlyRate());
        dto.setIsAvailable(profile.getIsAvailable());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public String getTutorEmail() { return tutorEmail; }
    public void setTutorEmail(String tutorEmail) { this.tutorEmail = tutorEmail; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Integer getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Double getCredibilityScore() { return credibilityScore; }
    public void setCredibilityScore(Double credibilityScore) { this.credibilityScore = credibilityScore; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
