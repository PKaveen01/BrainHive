package com.brainhive.modules.peerhelp.dto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.brainhive.modules.peerhelp.model.TutorAvailability;

/**
 * DTO for tutor availability responses.
 */
public class TutorAvailabilityResponseDTO {

    private Long id;
    private Long tutorId;
    private String tutorName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isRecurring;
    private LocalDateTime specificDate;
    private Boolean isActive;

    // Default constructor
    public TutorAvailabilityResponseDTO() {}

    // Constructor from entity
    public static TutorAvailabilityResponseDTO fromEntity(TutorAvailability availability) {
        TutorAvailabilityResponseDTO dto = new TutorAvailabilityResponseDTO();
        dto.setId(availability.getId());
        dto.setTutorId(availability.getTutor().getId());
        dto.setTutorName(availability.getTutor().getFullName());
        dto.setDayOfWeek(availability.getDayOfWeek());
        dto.setStartTime(availability.getStartTime());
        dto.setEndTime(availability.getEndTime());
        dto.setIsRecurring(availability.getIsRecurring());
        dto.setSpecificDate(availability.getSpecificDate());
        dto.setIsActive(availability.getIsActive());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

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
