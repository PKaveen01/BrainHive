package com.brainhive.modules.peerhelp.model;

import java.time.LocalDateTime;

import com.brainhive.modules.user.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Entity representing a rating given by a student after a tutoring session.
 * Used for credibility scoring of tutors.
 */
@Entity
@Table(name = "session_ratings")
public class SessionRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private TutorSession session;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @Column(nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "knowledge_rating")
    private Integer knowledgeRating; // 1-5

    @Column(name = "communication_rating")
    private Integer communicationRating; // 1-5

    @Column(name = "punctuality_rating")
    private Integer punctualityRating; // 1-5

    @Column(length = 1000)
    private String feedback;

    @Column(name = "would_recommend", nullable = false)
    private Boolean wouldRecommend = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public SessionRating() {}

    public SessionRating(TutorSession session, User student, User tutor, Integer rating) {
        this.session = session;
        this.student = student;
        this.tutor = tutor;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TutorSession getSession() { return session; }
    public void setSession(TutorSession session) { this.session = session; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public User getTutor() { return tutor; }
    public void setTutor(User tutor) { this.tutor = tutor; }

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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
