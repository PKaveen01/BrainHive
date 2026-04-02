package com.brainhive.modules.user.dto;

public class TerminateUserRequest {
    private int durationDays; // e.g. 7, 30, 90

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }
}
