package com.brainhive.modules.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "category")
    private String category; // e.g., Programming, Mathematics, Science

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @ManyToMany(mappedBy = "subjects")
    private Set<StudentProfile> students = new HashSet<>();

    @ManyToMany(mappedBy = "expertSubjects")
    private Set<TutorProfile> tutors = new HashSet<>();

    public Subject() {}

    public Subject(String name, String category) {
        this.name = name;
        this.category = category;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<StudentProfile> getStudents() { return students; }
    public void setStudents(Set<StudentProfile> students) { this.students = students; }

    public Set<TutorProfile> getTutors() { return tutors; }
    public void setTutors(Set<TutorProfile> tutors) { this.tutors = tutors; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}