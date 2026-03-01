package com.brainhive.modules.user.dto;

public class LoginRequestDTO {
    private String email;
    private String password;
    private String role; // "STUDENT" or "TUTOR"

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}