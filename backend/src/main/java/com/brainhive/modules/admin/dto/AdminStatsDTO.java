package com.brainhive.modules.admin.dto;

public class AdminStatsDTO {
    private long totalUsers;
    private long totalStudents;
    private long totalTutors;
    private long pendingTutors;
    private long approvedTutors;
    private long totalResources;
    private long activeResources;
    private long pendingResources;
    private long flaggedResources;
    private long pendingReports;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalTutors() { return totalTutors; }
    public void setTotalTutors(long totalTutors) { this.totalTutors = totalTutors; }
    public long getPendingTutors() { return pendingTutors; }
    public void setPendingTutors(long pendingTutors) { this.pendingTutors = pendingTutors; }
    public long getApprovedTutors() { return approvedTutors; }
    public void setApprovedTutors(long approvedTutors) { this.approvedTutors = approvedTutors; }
    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }
    public long getActiveResources() { return activeResources; }
    public void setActiveResources(long activeResources) { this.activeResources = activeResources; }
    public long getPendingResources() { return pendingResources; }
    public void setPendingResources(long pendingResources) { this.pendingResources = pendingResources; }
    public long getFlaggedResources() { return flaggedResources; }
    public void setFlaggedResources(long flaggedResources) { this.flaggedResources = flaggedResources; }
    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }
}
