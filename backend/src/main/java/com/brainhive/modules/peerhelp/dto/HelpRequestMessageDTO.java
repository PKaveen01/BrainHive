package com.brainhive.modules.peerhelp.dto;

import java.time.LocalDateTime;

import com.brainhive.modules.peerhelp.model.HelpRequestMessage;
import com.brainhive.modules.user.model.UserRole;

public class HelpRequestMessageDTO {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String body;
    private LocalDateTime createdAt;

    public static HelpRequestMessageDTO fromEntity(HelpRequestMessage m) {
        HelpRequestMessageDTO dto = new HelpRequestMessageDTO();
        dto.setId(m.getId());
        dto.setSenderId(m.getSender().getId());
        dto.setSenderName(m.getSender().getFullName());
        dto.setSenderRole(m.getSender().getRole() == UserRole.TUTOR ? "TUTOR" : "STUDENT");
        dto.setBody(m.getBody());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
