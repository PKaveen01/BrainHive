package com.brainhive.modules.collaboration.model;

import com.brainhive.modules.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_members")
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String role; // ADMIN, MEMBER

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    public GroupMember() {}

    public GroupMember(StudyGroup group, User user, String role) {
        this.group = group;
        this.user = user;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
