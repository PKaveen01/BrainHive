package com.brainhive.modules.resources.model;

import com.brainhive.modules.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_bookmarks")
public class ResourceBookmark {
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
    private LocalDateTime bookmarkedAt;

    public ResourceBookmark() {
        this.bookmarkedAt = LocalDateTime.now();
    }

    public ResourceBookmark(Resource resource, User user) {
        this.resource = resource;
        this.user = user;
        this.bookmarkedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getBookmarkedAt() { return bookmarkedAt; }
    public void setBookmarkedAt(LocalDateTime bookmarkedAt) { this.bookmarkedAt = bookmarkedAt; }
}