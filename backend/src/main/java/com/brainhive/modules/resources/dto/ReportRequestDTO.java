package com.brainhive.modules.resources.dto;

public class ReportRequestDTO {
    private String reason;
    private String description;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}