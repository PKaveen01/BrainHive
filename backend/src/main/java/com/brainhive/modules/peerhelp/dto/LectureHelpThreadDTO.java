package com.brainhive.modules.peerhelp.dto;

import java.util.List;

public class LectureHelpThreadDTO {

    private HelpRequestResponseDTO helpRequest;
    private List<HelpRequestMessageDTO> messages;

    public LectureHelpThreadDTO() {}

    public LectureHelpThreadDTO(HelpRequestResponseDTO helpRequest, List<HelpRequestMessageDTO> messages) {
        this.helpRequest = helpRequest;
        this.messages = messages;
    }

    public HelpRequestResponseDTO getHelpRequest() { return helpRequest; }
    public void setHelpRequest(HelpRequestResponseDTO helpRequest) { this.helpRequest = helpRequest; }

    public List<HelpRequestMessageDTO> getMessages() { return messages; }
    public void setMessages(List<HelpRequestMessageDTO> messages) { this.messages = messages; }
}
