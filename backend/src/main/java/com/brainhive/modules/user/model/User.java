package com.brainhive.modules.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /**
     * Account status:
     *   ACTIVE      – fully usable account (students, approved tutors, admins)
     *   PENDING     – tutor waiting for admin approval
     *   SUSPENDED   – blocked by admin
     *   TERMINATED  – temporarily banned by admin until terminatedUntil
     *   REJECTED    – tutor application rejected
     */
    @Column(name = "account_status", nullable = false)
    private String accountStatus = "ACTIVE";

    /**
     * When a user is TERMINATED, this stores the date/time until which
     * the termination lasts. Null if the user is not terminated.
     */
    @Column(name = "terminated_until")
    private LocalDateTime terminatedUntil;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {}

    public User(String email, String password, String fullName, UserRole role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.accountStatus = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ─── Getters and Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    /** Returns the datetime until which this user is terminated, or null if not terminated. */
    public LocalDateTime getTerminatedUntil() { return terminatedUntil; }
    public void setTerminatedUntil(LocalDateTime terminatedUntil) { this.terminatedUntil = terminatedUntil; }

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