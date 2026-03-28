package com.brainhive.modules.user.dto;

import jakarta.validation.constraints.*;
import java.util.Set;

public class TutorRegistrationRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    // Tutor Profile Fields
    @NotBlank(message = "Qualification is required")
    private String qualification;

    private Integer yearsOfExperience;

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    @NotNull(message = "Please select at least one subject to teach")
    private Set<String> expertSubjects;

    private Set<String> availabilitySlots;

    private Integer maxConcurrentStudents;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Set<String> getExpertSubjects() { return expertSubjects; }
    public void setExpertSubjects(Set<String> expertSubjects) { this.expertSubjects = expertSubjects; }

    public Set<String> getAvailabilitySlots() { return availabilitySlots; }
    public void setAvailabilitySlots(Set<String> availabilitySlots) { this.availabilitySlots = availabilitySlots; }

    public Integer getMaxConcurrentStudents() { return maxConcurrentStudents; }
    public void setMaxConcurrentStudents(Integer maxConcurrentStudents) { this.maxConcurrentStudents = maxConcurrentStudents; }
}