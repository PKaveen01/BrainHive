package com.brainhive.modules.peerhelp.controller;

import com.brainhive.modules.peerhelp.dto.ApiResponse;
import com.brainhive.modules.peerhelp.dto.SubjectDTO;
import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.peerhelp.service.SubjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peerhelp/subjects")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    /**
     * Get all subjects.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getAllSubjects() {
        List<SubjectDTO> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
    }

    /**
     * Get subject by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> getSubjectById(@PathVariable Long id) {
        try {
            Subject subject = subjectService.getSubjectById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
            return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully", SubjectDTO.fromEntity(subject)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create a new subject.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubjectDTO>> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        try {
            Subject subject = subjectService.createSubject(request.getName(), request.getDescription());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Subject created successfully", SubjectDTO.fromEntity(subject)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update a subject.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody CreateSubjectRequest request) {
        try {
            Subject subject = subjectService.updateSubject(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", SubjectDTO.fromEntity(subject)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete a subject.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Request body for creating/updating subjects.
     */
    public static class CreateSubjectRequest {
        @NotBlank(message = "Subject name is required")
        @Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
        private String name;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
