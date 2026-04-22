package com.brainhive.modules.collaboration.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class CollaborationDTOs {

    // ---- Request DTOs ----

    public static class CreateGroupRequest {
        private String name;
        private String description;
        private String subject;
        private String goal;
        private Integer maxMembers;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getGoal() { return goal; }
        public void setGoal(String goal) { this.goal = goal; }
        public Integer getMaxMembers() { return maxMembers; }
        public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    }

    public static class JoinGroupRequest {
        private String inviteCode;
        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
    }

    public static class SendMessageRequest {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class CreateTaskRequest {
        private String title;
        private String description;
        private Long assignedToUserId;
        private LocalDate dueDate;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getAssignedToUserId() { return assignedToUserId; }
        public void setAssignedToUserId(Long assignedToUserId) { this.assignedToUserId = assignedToUserId; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    }

    public static class UpdateTaskStatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class CreateEventRequest {
        private String title;
        private String description;
        private LocalDateTime eventTime;
        private String location;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getEventTime() { return eventTime; }
        public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    // ---- Response DTOs ----

    public static class MemberDTO {
        private Long userId;
        private String fullName;
        private String email;
        private String role;
        private LocalDateTime joinedAt;

        public MemberDTO(Long userId, String fullName, String email, String role, LocalDateTime joinedAt) {
            this.userId = userId; this.fullName = fullName; this.email = email;
            this.role = role; this.joinedAt = joinedAt;
        }
        public Long getUserId() { return userId; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public LocalDateTime getJoinedAt() { return joinedAt; }
    }

    public static class GroupResponseDTO {
        private Long id;
        private String name;
        private String description;
        private String subject;
        private String goal;
        private String inviteCode;
        private String createdByName;
        private Long createdById;
        private Integer maxMembers;
        private Integer currentMembers;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private List<MemberDTO> members;
        private String currentUserRole;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getGoal() { return goal; }
        public void setGoal(String goal) { this.goal = goal; }
        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public Long getCreatedById() { return createdById; }
        public void setCreatedById(Long createdById) { this.createdById = createdById; }
        public Integer getMaxMembers() { return maxMembers; }
        public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
        public Integer getCurrentMembers() { return currentMembers; }
        public void setCurrentMembers(Integer currentMembers) { this.currentMembers = currentMembers; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public List<MemberDTO> getMembers() { return members; }
        public void setMembers(List<MemberDTO> members) { this.members = members; }
        public String getCurrentUserRole() { return currentUserRole; }
        public void setCurrentUserRole(String currentUserRole) { this.currentUserRole = currentUserRole; }
    }

    public static class MessageResponseDTO {
        private Long id;
        private Long groupId;
        private Long senderId;
        private String senderName;
        private String content;
        private LocalDateTime sentAt;

        public MessageResponseDTO(Long id, Long groupId, Long senderId, String senderName, String content, LocalDateTime sentAt) {
            this.id = id; this.groupId = groupId; this.senderId = senderId;
            this.senderName = senderName; this.content = content; this.sentAt = sentAt;
        }
        public Long getId() { return id; }
        public Long getGroupId() { return groupId; }
        public Long getSenderId() { return senderId; }
        public String getSenderName() { return senderName; }
        public String getContent() { return content; }
        public LocalDateTime getSentAt() { return sentAt; }
    }

    public static class TaskResponseDTO {
        private Long id;
        private Long groupId;
        private String title;
        private String description;
        private String assignedToName;
        private Long assignedToUserId;
        private String createdByName;
        private LocalDate dueDate;
        private String status;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
        public Long getAssignedToUserId() { return assignedToUserId; }
        public void setAssignedToUserId(Long assignedToUserId) { this.assignedToUserId = assignedToUserId; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class EventResponseDTO {
        private Long id;
        private Long groupId;
        private String title;
        private String description;
        private LocalDateTime eventTime;
        private String location;
        private String createdByName;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getEventTime() { return eventTime; }
        public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
