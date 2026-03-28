package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.Lecture;

public class LectureResponseDTO {

    private Long id;
    private Long tutorId;
    private String tutorName;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private LocalDateTime createdAt;

    public static LectureResponseDTO fromEntity(Lecture lecture) {
        LectureResponseDTO dto = new LectureResponseDTO();
        dto.setId(lecture.getId());
        dto.setTutorId(lecture.getTutor().getId());
        dto.setTutorName(lecture.getTutor().getFullName());
        dto.setSubjectId(lecture.getSubject().getId());
        dto.setSubjectName(lecture.getSubject().getName());
        dto.setTitle(lecture.getTitle());
        dto.setDescription(lecture.getDescription());
        dto.setScheduledAt(lecture.getScheduledAt());
        dto.setDurationMinutes(lecture.getDurationMinutes());
        dto.setMeetingLink(lecture.getMeetingLink());
        dto.setCreatedAt(lecture.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
