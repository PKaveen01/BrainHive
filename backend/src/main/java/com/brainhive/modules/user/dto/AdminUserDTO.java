package com.brainhive.modules.user.dto;

import java.time.LocalDateTime;

public class AdminUserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String accountStatus;
    private LocalDateTime terminatedUntil;
    private LocalDateTime createdAt;
    // Tutor-specific
    private String verificationStatus;
    private String qualification;

    public AdminUserDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public LocalDateTime getTerminatedUntil() { return terminatedUntil; }
    public void setTerminatedUntil(LocalDateTime terminatedUntil) { this.terminatedUntil = terminatedUntil; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
}
