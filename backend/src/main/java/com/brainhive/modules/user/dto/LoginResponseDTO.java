package com.brainhive.modules.user.dto;

public class LoginResponseDTO {
    private boolean success;
    private String message;
    private String redirectUrl;
    private String fullName;
    private String email;
    private String role;
    private Long userId;

    public LoginResponseDTO(boolean success, String message, String redirectUrl,
                            String fullName, String email, String role) {
        this.success = success;
        this.message = message;
        this.redirectUrl = redirectUrl;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public LoginResponseDTO(boolean success, String message, String redirectUrl,
                            String fullName, String email, String role, Long userId) {
        this.success = success;
        this.message = message;
        this.redirectUrl = redirectUrl;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.userId = userId;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
