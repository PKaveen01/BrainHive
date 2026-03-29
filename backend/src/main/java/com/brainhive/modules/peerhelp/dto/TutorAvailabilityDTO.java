package com.brainhive.modules.peerhelp.dto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating/updating tutor availability.
 */
public class TutorAvailabilityDTO {

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Boolean isRecurring = true;

    @Future(message = "Specific date must be in the future")
    private LocalDateTime specificDate;

    private Boolean isActive = true;

    // Getters and Setters
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public LocalDateTime getSpecificDate() { return specificDate; }
    public void setSpecificDate(LocalDateTime specificDate) { this.specificDate = specificDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
