package com.brainhive.modules.user.dto;

import jakarta.validation.constraints.*;
import java.util.Set;

public class StudentRegistrationRequest {

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

    // Academic Profile Fields (Step 2)
    private String degreeProgram;
    private String currentYear;
    private String currentSemester;
    private Set<String> subjects;
    private Set<String> strongSubjects;
    private Set<String> weakSubjects;
    private String studyStyle;
    private Integer availabilityHours;
    private String preferredTime;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getDegreeProgram() { return degreeProgram; }
    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public String getCurrentYear() { return currentYear; }
    public void setCurrentYear(String currentYear) { this.currentYear = currentYear; }

    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }

    public Set<String> getSubjects() { return subjects; }
    public void setSubjects(Set<String> subjects) { this.subjects = subjects; }

    public Set<String> getStrongSubjects() { return strongSubjects; }
    public void setStrongSubjects(Set<String> strongSubjects) { this.strongSubjects = strongSubjects; }

    public Set<String> getWeakSubjects() { return weakSubjects; }
    public void setWeakSubjects(Set<String> weakSubjects) { this.weakSubjects = weakSubjects; }

    public String getStudyStyle() { return studyStyle; }
    public void setStudyStyle(String studyStyle) { this.studyStyle = studyStyle; }

    public Integer getAvailabilityHours() { return availabilityHours; }
    public void setAvailabilityHours(Integer availabilityHours) { this.availabilityHours = availabilityHours; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }
}