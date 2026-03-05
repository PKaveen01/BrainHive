package com.brainhive.modules.user.dto;

public class ProfileCompletionDTO {
    private Long userId;
    private Boolean profileCompleted;
    private Integer completionPercentage;
    private String redirectUrl;

    public ProfileCompletionDTO() {}

    public ProfileCompletionDTO(Long userId, Boolean profileCompleted, Integer completionPercentage, String redirectUrl) {
        this.userId = userId;
        this.profileCompleted = profileCompleted;
        this.completionPercentage = completionPercentage;
        this.redirectUrl = redirectUrl;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
}