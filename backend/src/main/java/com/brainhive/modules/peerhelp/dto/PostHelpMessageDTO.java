package com.brainhive.modules.peerhelp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostHelpMessageDTO {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 4000, message = "Message is too long")
    private String body;

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
