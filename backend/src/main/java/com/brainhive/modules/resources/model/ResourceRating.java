package com.brainhive.modules.resources.model;

import com.brainhive.modules.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_ratings")
public class ResourceRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1-5

    private String review;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public ResourceRating() {
        this.createdAt = LocalDateTime.now();
    }

    public ResourceRating(Resource resource, User user, Integer rating, String review) {
        this.resource = resource;
        this.user = user;
        this.rating = rating;
        this.review = review;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Helper method to check if rating is valid
    public boolean isValidRating() {
        return rating != null && rating >= 1 && rating <= 5;
    }
}