package com.brainhive.modules.peerhelp.controller;

import com.brainhive.modules.peerhelp.dto.*;
import com.brainhive.modules.peerhelp.service.TutorProfileService;
import com.brainhive.modules.user.model.User;
import com.brainhive.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peerhelp/tutor-profiles")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TutorProfileController {

    @Autowired
    private TutorProfileService tutorProfileService;

    @Autowired
    private UserService userService;

    /**
     * Create or update tutor profile.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TutorProfileResponseDTO>> createOrUpdateProfile(
            @Valid @RequestBody TutorProfileDTO dto,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorProfileResponseDTO profile = tutorProfileService.createOrUpdateProfile(currentUser.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Profile created/updated successfully", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get current tutor's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TutorProfileResponseDTO>> getMyProfile(HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorProfileResponseDTO profile = tutorProfileService.getProfileByTutorId(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get tutor profile by tutor ID.
     */
    @GetMapping("/{tutorId}")
    public ResponseEntity<ApiResponse<TutorProfileResponseDTO>> getProfileByTutorId(@PathVariable Long tutorId) {
        try {
            TutorProfileResponseDTO profile = tutorProfileService.getProfileByTutorId(tutorId);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all tutor profiles.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TutorProfileResponseDTO>>> getAllProfiles() {
        List<TutorProfileResponseDTO> profiles = tutorProfileService.getAllProfiles();
        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", profiles));
    }

    /**
     * Get available tutors by subject.
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<TutorProfileResponseDTO>>> getAvailableTutorsBySubject(
            @PathVariable Long subjectId) {
        List<TutorProfileResponseDTO> tutors = tutorProfileService.getAvailableTutorsBySubject(subjectId);
        return ResponseEntity.ok(ApiResponse.success("Tutors retrieved successfully", tutors));
    }

    /**
     * Get qualified tutors with minimum proficiency.
     */
    @GetMapping("/subject/{subjectId}/qualified")
    public ResponseEntity<ApiResponse<List<TutorProfileResponseDTO>>> getQualifiedTutors(
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "3") Integer minProficiency) {
        List<TutorProfileResponseDTO> tutors = tutorProfileService.getQualifiedTutors(subjectId, minProficiency);
        return ResponseEntity.ok(ApiResponse.success("Qualified tutors retrieved successfully", tutors));
    }

    /**
     * Update availability status.
     */
    @PatchMapping("/me/availability")
    public ResponseEntity<ApiResponse<TutorProfileResponseDTO>> updateAvailability(
            @RequestParam Boolean isAvailable,
            HttpSession session) {
        try {
            User currentUser = userService.getCurrentUser(session);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Please login to continue"));
            }

            TutorProfileResponseDTO profile = tutorProfileService.updateAvailability(currentUser.getId(), isAvailable);
            return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
