package com.brainhive.modules.resources.dto;

public class ResourceDTO {
    private String title;
    private String description;
    private String subject;
    private String semester;
    private String type;
    private String tags;
    private String visibility;
    private String courseCode;
    private String link;
    private String license;
    private Boolean allowRatings;
    private Boolean allowComments;
    private String userId;  // ✅ Changed from Long to String

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public Boolean getAllowRatings() { return allowRatings; }
    public void setAllowRatings(Boolean allowRatings) { this.allowRatings = allowRatings; }

    public Boolean getAllowComments() { return allowComments; }
    public void setAllowComments(Boolean allowComments) { this.allowComments = allowComments; }

    public String getUserId() { return userId; }  // ✅ Now returns String
    public void setUserId(String userId) { this.userId = userId; }  // ✅ Now accepts String
}