package com.brainhive.modules.peerhelp.dto;

import com.brainhive.modules.user.model.Subject;

/**
 * DTO for subject responses.
 */
public class SubjectDTO {

    private Long id;
    private String name;
    private String description;
    private String category;

    // Default constructor
    public SubjectDTO() {}

    public SubjectDTO(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Constructor from entity
    public static SubjectDTO fromEntity(Subject subject) {
        SubjectDTO dto = new SubjectDTO(subject.getId(), subject.getName(), subject.getDescription());
        dto.setCategory(subject.getCategory());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
