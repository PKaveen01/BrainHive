package com.brainhive.modules.resources.model;

import com.brainhive.modules.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore; // Add this import

@Entity
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String type;

    private String filePath;
    private String fileName;
    private Long fileSize;
    private String fileType;

    @Column(length = 500)
    private String link;

    private String tags;
    private String courseCode;
    private String visibility;
    private String license;
    private Boolean allowRatings;
    private Boolean allowComments;
    private String status;
    private Integer downloadCount;
    private Integer viewCount;
    private Double averageRating;
    private Integer ratingCount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "moderation_notes", length = 1000)
    private String moderationNotes;

    @JsonIgnore // Add this to prevent lazy loading
    @ManyToMany
    @JoinTable(
            name = "resource_bookmarks",
            joinColumns = @JoinColumn(name = "resource_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> bookmarkedBy = new ArrayList<>();

    @JsonIgnore // Add this to prevent lazy loading
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResourceRating> ratings = new ArrayList<>();

    @JsonIgnore // Add this to prevent lazy loading
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResourceReport> reports = new ArrayList<>();

    public Resource() {
        this.uploadedAt = LocalDateTime.now();
        this.status = "pending";
        this.downloadCount = 0;
        this.viewCount = 0;
        this.averageRating = 0.0;
        this.ratingCount = 0;
        this.allowRatings = true;
        this.allowComments = true;
    }

    // Helper methods to manage relationships
    public void addBookmark(User user) {
        this.bookmarkedBy.add(user);
    }

    public void removeBookmark(User user) {
        this.bookmarkedBy.remove(user);
    }

    public void addRating(ResourceRating rating) {
        this.ratings.add(rating);
        rating.setResource(this);
    }

    public void removeRating(ResourceRating rating) {
        this.ratings.remove(rating);
        rating.setResource(null);
    }

    public void addReport(ResourceReport report) {
        this.reports.add(report);
        report.setResource(this);
    }

    public void removeReport(ResourceReport report) {
        this.reports.remove(report);
        report.setResource(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public Boolean getAllowRatings() { return allowRatings; }
    public void setAllowRatings(Boolean allowRatings) { this.allowRatings = allowRatings; }

    public Boolean getAllowComments() { return allowComments; }
    public void setAllowComments(Boolean allowComments) { this.allowComments = allowComments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public LocalDateTime getModeratedAt() { return moderatedAt; }
    public void setModeratedAt(LocalDateTime moderatedAt) { this.moderatedAt = moderatedAt; }

    public String getModerationNotes() { return moderationNotes; }
    public void setModerationNotes(String moderationNotes) { this.moderationNotes = moderationNotes; }

    @JsonIgnore
    public List<User> getBookmarkedBy() { return bookmarkedBy; }
    public void setBookmarkedBy(List<User> bookmarkedBy) { this.bookmarkedBy = bookmarkedBy; }

    @JsonIgnore
    public List<ResourceRating> getRatings() { return ratings; }
    public void setRatings(List<ResourceRating> ratings) { this.ratings = ratings; }

    @JsonIgnore
    public List<ResourceReport> getReports() { return reports; }
    public void setReports(List<ResourceReport> reports) { this.reports = reports; }
}