package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.TutorSession;

/**
 * DTO for tutor session responses.
 */
public class TutorSessionResponseDTO {

    private Long id;
    private Long helpRequestId;
    private String requestTopic;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String tutorName;
    private String subjectName;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String meetingLink;
    private String notes;
    private Boolean isCompleted;
    private LocalDateTime createdAt;

    // Default constructor
    public TutorSessionResponseDTO() {}

    // Constructor from entity
    public static TutorSessionResponseDTO fromEntity(TutorSession session) {
        TutorSessionResponseDTO dto = new TutorSessionResponseDTO();
        dto.setId(session.getId());
        dto.setHelpRequestId(session.getHelpRequest().getId());
        dto.setRequestTopic(session.getHelpRequest().getTopic());
        dto.setStudentId(session.getStudent().getId());
        dto.setStudentName(session.getStudent().getFullName());
        dto.setTutorId(session.getTutor().getId());
        dto.setTutorName(session.getTutor().getFullName());
        dto.setSubjectName(session.getHelpRequest().getSubject().getName());
        dto.setScheduledStartTime(session.getScheduledStartTime());
        dto.setScheduledEndTime(session.getScheduledEndTime());
        dto.setActualStartTime(session.getActualStartTime());
        dto.setActualEndTime(session.getActualEndTime());
        dto.setMeetingLink(session.getMeetingLink());
        dto.setNotes(session.getNotes());
        dto.setIsCompleted(session.getIsCompleted());
        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(Long helpRequestId) { this.helpRequestId = helpRequestId; }

    public String getRequestTopic() { return requestTopic; }
    public void setRequestTopic(String requestTopic) { this.requestTopic = requestTopic; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public LocalDateTime getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public LocalDateTime getActualStartTime() { return actualStartTime; }
    public void setActualStartTime(LocalDateTime actualStartTime) { this.actualStartTime = actualStartTime; }

    public LocalDateTime getActualEndTime() { return actualEndTime; }
    public void setActualEndTime(LocalDateTime actualEndTime) { this.actualEndTime = actualEndTime; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
