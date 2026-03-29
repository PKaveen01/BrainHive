package com.brainhive.modules.peerhelp.model;

import java.time.LocalDateTime;

import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.model.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * Entity representing a help request created by a student.
 * This is the main entity for the peer help system.
 */
@Entity
@Table(name = "help_requests")
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String topic;

    @Column(length = 2000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HelpRequestStatus status = HelpRequestStatus.PENDING;

    @Column(name = "urgency_level")
    private Integer urgencyLevel; // 1-5, 5 being most urgent

    @Column(name = "preferred_date_time")
    private LocalDateTime preferredDateTime;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration; // in minutes

    @ManyToOne
    @JoinColumn(name = "assigned_tutor_id")
    private User assignedTutor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public HelpRequest() {}

    public HelpRequest(User student, Subject subject, String topic, String description) {
        this.student = student;
        this.subject = subject;
        this.topic = topic;
        this.description = description;
        this.status = HelpRequestStatus.PENDING;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

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

    public User getAssignedTutor() { return assignedTutor; }
    public void setAssignedTutor(User assignedTutor) { this.assignedTutor = assignedTutor; }

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
