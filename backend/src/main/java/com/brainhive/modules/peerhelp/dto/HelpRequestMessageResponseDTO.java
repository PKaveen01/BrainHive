package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.HelpRequestMessage;

public class HelpRequestMessageResponseDTO {

    private Long id;
    private Long requestId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private LocalDateTime createdAt;

    public static HelpRequestMessageResponseDTO fromEntity(HelpRequestMessage entity) {
        HelpRequestMessageResponseDTO dto = new HelpRequestMessageResponseDTO();
        dto.setId(entity.getId());
        dto.setRequestId(entity.getHelpRequest().getId());
        dto.setSenderId(entity.getSender().getId());
        dto.setSenderName(entity.getSender().getFullName());
        dto.setSenderRole(entity.getSender().getRole().name());
        dto.setMessage(entity.getMessageText());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
