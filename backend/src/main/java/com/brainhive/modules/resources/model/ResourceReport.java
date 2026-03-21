package com.brainhive.modules.resources.model;

import com.brainhive.modules.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_reports")
public class ResourceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @Column(nullable = false)
    private String reason;

    private String description;

    @Column(nullable = false)
    private String status = "pending";

    @Column(nullable = false)
    private LocalDateTime reportedAt;

    private LocalDateTime reviewedAt;

    public ResourceReport() {
        this.reportedAt = LocalDateTime.now();
        this.status = "pending";
    }

    public ResourceReport(Resource resource, User reportedBy, String reason, String description) {
        this.resource = resource;
        this.reportedBy = reportedBy;
        this.reason = reason;
        this.description = description;
        this.reportedAt = LocalDateTime.now();
        this.status = "pending";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getReportedBy() { return reportedBy; }
    public void setReportedBy(User reportedBy) { this.reportedBy = reportedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    // Helper methods
    public boolean isPending() {
        return "pending".equals(status);
    }

    public void markAsReviewed() {
        this.status = "reviewed";
        this.reviewedAt = LocalDateTime.now();
    }

    public void markAsResolved() {
        this.status = "resolved";
        this.reviewedAt = LocalDateTime.now();
    }
}