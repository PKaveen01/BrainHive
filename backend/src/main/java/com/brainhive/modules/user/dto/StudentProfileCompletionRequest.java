package com.brainhive.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class StudentProfileCompletionRequest {

    @NotBlank(message = "Degree program is required")
    private String degreeProgram;

    @NotBlank(message = "Current year is required")
    private String currentYear;

    @NotBlank(message = "Current semester is required")
    private String currentSemester;

    private List<String> subjects;
    private List<String> strongSubjects;
    private List<String> weakSubjects;

    @NotBlank(message = "Study style is required")
    private String studyStyle;

    @NotNull(message = "Availability hours is required")
    private Integer availabilityHours;

    @NotBlank(message = "Preferred time is required")
    private String preferredTime;

    // Getters and Setters
    public String getDegreeProgram() { return degreeProgram; }
    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public String getCurrentYear() { return currentYear; }
    public void setCurrentYear(String currentYear) { this.currentYear = currentYear; }

    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }

    public List<String> getStrongSubjects() { return strongSubjects; }
    public void setStrongSubjects(List<String> strongSubjects) { this.strongSubjects = strongSubjects; }

    public List<String> getWeakSubjects() { return weakSubjects; }
    public void setWeakSubjects(List<String> weakSubjects) { this.weakSubjects = weakSubjects; }

    public String getStudyStyle() { return studyStyle; }
    public void setStudyStyle(String studyStyle) { this.studyStyle = studyStyle; }

    public Integer getAvailabilityHours() { return availabilityHours; }
    public void setAvailabilityHours(Integer availabilityHours) { this.availabilityHours = availabilityHours; }

    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }
}