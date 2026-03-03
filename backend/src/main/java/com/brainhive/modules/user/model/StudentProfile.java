package com.brainhive.modules.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "degree_program")
    private String degreeProgram;

    @Column(name = "current_year")
    private String currentYear; // Year 1, Year 2, Year 3, Year 4, Postgraduate

    @Column(name = "current_semester")
    private String currentSemester; // Semester 1, Semester 2, Trimester

    @Column(name = "study_style")
    private String studyStyle; // Solo, Group, Both

    @Column(name = "availability_hours")
    private Integer availabilityHours; // Hours per day

    @Column(name = "preferred_time")
    private String preferredTime; // Morning, Afternoon, Evening, Night

    @Column(name = "profile_completed")
    private Boolean profileCompleted = false;

    @Column(name = "profile_completion_percentage")
    private Integer profileCompletionPercentage = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToMany
    @JoinTable(
            name = "student_subjects",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "student_weak_subjects", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "subject_name")
    private Set<String> weakSubjects = new HashSet<>();

    public StudentProfile() {}

    public StudentProfile(User user) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDegreeProgram() { return degreeProgram; }
    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public String getCurrentYear() { return currentYear; }
    public void setCurrentYear(String currentYear) { this.currentYear = currentYear; }

    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }

    public String getStudyStyle() { return studyStyle; }
    public void setStudyStyle(String studyStyle) { this.studyStyle = studyStyle; }

    public Integer getAvailabilityHours() { return availabilityHours; }
    public void setAvailabilityHours(Integer availabilityHours) { this.availabilityHours = availabilityHours; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public Integer getProfileCompletionPercentage() { return profileCompletionPercentage; }
    public void setProfileCompletionPercentage(Integer profileCompletionPercentage) { this.profileCompletionPercentage = profileCompletionPercentage; }

    public Set<Subject> getSubjects() { return subjects; }
    public void setSubjects(Set<Subject> subjects) { this.subjects = subjects; }

    public Set<String> getWeakSubjects() { return weakSubjects; }
    public void setWeakSubjects(Set<String> weakSubjects) { this.weakSubjects = weakSubjects; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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