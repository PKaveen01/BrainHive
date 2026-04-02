package com.brainhive.modules.user.dto;

public class AddUserRequest {
    private String email;
    private String fullName;
    private String password;
    private String role; // STUDENT or TUTOR
    // Tutor extras
    private String qualification;
    private String bio;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
