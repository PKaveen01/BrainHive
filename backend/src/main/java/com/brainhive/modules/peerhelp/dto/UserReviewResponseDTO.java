package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.UserReview;

public class UserReviewResponseDTO {

    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerRole;
    private Integer rating;
    private String title;
    private String reviewText;
    private LocalDateTime createdAt;

    public static UserReviewResponseDTO fromEntity(UserReview review) {
        UserReviewResponseDTO dto = new UserReviewResponseDTO();
        dto.setId(review.getId());
        dto.setReviewerId(review.getReviewer().getId());
        dto.setReviewerName(review.getReviewer().getFullName());
        dto.setReviewerRole(review.getReviewer().getRole().name());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setReviewText(review.getReviewText());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getReviewerRole() { return reviewerRole; }
    public void setReviewerRole(String reviewerRole) { this.reviewerRole = reviewerRole; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
