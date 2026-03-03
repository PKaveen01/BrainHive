package com.brainhive.modules.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tutor_profiles")
public class TutorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Fields from user module
    @Column(name = "qualification")
    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "bio", length = 1000)
    private String bio;

    @Column(name = "verification_document_path")
    private String verificationDocumentPath;

    @Column(name = "verification_status")
    private String verificationStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "max_concurrent_students")
    private Integer maxConcurrentStudents = 5;

    @Column(name = "profile_completed")
    private Boolean profileCompleted = false;

    // Fields from peerhelp module
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "proficiency_level")
    private Integer proficiencyLevel; // 1-5 scale

    @Column(name = "total_sessions")
    private Integer totalSessions = 0;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "credibility_score")
    private Double credibilityScore = 0.0;

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many-to-many for multiple expert subjects (user module style)
    @ManyToMany
    @JoinTable(
            name = "tutor_subjects",
            joinColumns = @JoinColumn(name = "tutor_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> expertSubjects = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "tutor_availability_slots", joinColumns = @JoinColumn(name = "tutor_id"))
    private Set<String> availabilitySlots = new HashSet<>();

    public TutorProfile() {}

    public TutorProfile(User user) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Alias: peerhelp used "tutor" field name, user used "user" field name
    // We keep "user" as the canonical field, and provide getTutor()/setTutor() as aliases
    public User getTutor() { return user; }
    public void setTutor(User tutor) { this.user = tutor; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getVerificationDocumentPath() { return verificationDocumentPath; }
    public void setVerificationDocumentPath(String verificationDocumentPath) { this.verificationDocumentPath = verificationDocumentPath; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public Integer getMaxConcurrentStudents() { return maxConcurrentStudents; }
    public void setMaxConcurrentStudents(Integer maxConcurrentStudents) { this.maxConcurrentStudents = maxConcurrentStudents; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Integer getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Double getCredibilityScore() { return credibilityScore; }
    public void setCredibilityScore(Double credibilityScore) { this.credibilityScore = credibilityScore; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Set<Subject> getExpertSubjects() { return expertSubjects; }
    public void setExpertSubjects(Set<Subject> expertSubjects) { this.expertSubjects = expertSubjects; }

    public Set<String> getAvailabilitySlots() { return availabilitySlots; }
    public void setAvailabilitySlots(Set<String> availabilitySlots) { this.availabilitySlots = availabilitySlots; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /**
     * Calculates credibility score based on ratings and sessions.
     */
    public void calculateCredibilityScore() {
        double ratingComponent = this.averageRating * 0.6;
        double sessionComponent = (Math.min(this.totalSessions, 50) / 50.0) * 5 * 0.4;
        this.credibilityScore = ratingComponent + sessionComponent;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
