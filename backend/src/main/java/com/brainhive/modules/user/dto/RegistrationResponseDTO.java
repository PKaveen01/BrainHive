package com.brainhive.modules.user.dto;

public class RegistrationResponseDTO {
    private boolean success;
    private String message;
    private Long userId;
    private boolean profileCompleted;
    private String redirectUrl;

    public RegistrationResponseDTO() {}

    public RegistrationResponseDTO(boolean success, String message, Long userId, boolean profileCompleted, String redirectUrl) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.profileCompleted = profileCompleted;
        this.redirectUrl = redirectUrl;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
}